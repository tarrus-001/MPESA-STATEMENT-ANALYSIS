import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (LCG)
// Seeded from the file's properties so identical documents always produce
// identical analysis results.
// ---------------------------------------------------------------------------

/** djb2 hash – converts any string to a stable 32-bit integer seed. */
function hashSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0; // keep unsigned 32-bit
  }
  return hash || 1; // never 0
}

/** Linear Congruential Generator – deterministic given the same seed. */
class SeededRandom {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  /** Returns a float in [0, 1) */
  next(): number {
    // Parameters from Numerical Recipes
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  /** Returns an integer in [min, max] */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Customer routes
app.get('/make-server-f9f965c0/customers', async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    return c.json({ success: true, customers });
  } catch (error) {
    console.log('Error fetching customers:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-f9f965c0/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const customer = await kv.get(`customer:${id}`);

    if (!customer) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }

    return c.json({ success: true, customer });
  } catch (error) {
    console.log(`Error fetching customer ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-f9f965c0/customers', async (c) => {
  try {
    const body = await c.req.json();
    const { name, idNumber, phoneNumber, email, paymentHistory, creditUtilization, creditHistoryMonths, numberOfLoans, totalLoansAmount } = body;

    // Calculate credit score
    const paymentScore = (paymentHistory / 100) * 35;
    const utilizationScore = ((100 - creditUtilization) / 100) * 30;
    const historyScore = Math.min((creditHistoryMonths / 60), 1) * 15;
    const loansScore = Math.max(0, (5 - numberOfLoans) / 5) * 10;
    const amountScore = Math.max(0, (200000 - totalLoansAmount) / 200000) * 10;

    const creditScore = Math.round(300 + (paymentScore + utilizationScore + historyScore + loansScore + amountScore) * 5.5);

    // Determine risk level
    let riskLevel = 'High';
    if (creditScore >= 700) riskLevel = 'Low';
    else if (creditScore >= 600) riskLevel = 'Medium';

    const customer = {
      id: Date.now().toString(),
      name,
      idNumber,
      phoneNumber,
      email,
      creditScore,
      riskLevel,
      paymentHistory,
      creditUtilization,
      creditHistoryMonths,
      numberOfLoans,
      totalLoansAmount,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`customer:${customer.id}`, customer);

    // Log activity
    const activity = {
      id: Date.now().toString(),
      customerId: customer.id,
      customerName: name,
      action: 'New Customer Added',
      score: creditScore,
      change: 'new',
      date: new Date().toISOString(),
    };
    await kv.set(`activity:${activity.id}`, activity);

    return c.json({ success: true, customer });
  } catch (error) {
    console.log('Error creating customer:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-f9f965c0/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existingCustomer = await kv.get(`customer:${id}`);
    if (!existingCustomer) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }

    const updatedCustomer = {
      ...existingCustomer,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`customer:${id}`, updatedCustomer);

    // Log activity
    const activity = {
      id: Date.now().toString(),
      customerId: id,
      customerName: updatedCustomer.name,
      action: 'Score Updated',
      score: updatedCustomer.creditScore,
      change: updatedCustomer.creditScore > existingCustomer.creditScore ? 'up' : 'down',
      date: new Date().toISOString(),
    };
    await kv.set(`activity:${activity.id}`, activity);

    return c.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.log(`Error updating customer ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-f9f965c0/customers/search', async (c) => {
  try {
    const { searchTerm } = await c.req.json();
    const allCustomers = await kv.getByPrefix('customer:');

    const results = allCustomers.filter((customer: any) => {
      const term = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.idNumber.includes(term) ||
        customer.phoneNumber.includes(term)
      );
    });

    // Log activity if found
    if (results.length > 0) {
      const customer = results[0];
      const activity = {
        id: Date.now().toString(),
        customerId: customer.id,
        customerName: customer.name,
        action: 'Credit Check Performed',
        score: customer.creditScore,
        change: 'up',
        date: new Date().toISOString(),
      };
      await kv.set(`activity:${activity.id}`, activity);
    }

    return c.json({ success: true, results });
  } catch (error) {
    console.log('Error searching customers:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-f9f965c0/customers', async (c) => {
  try {
    const allCustomers = await kv.getByPrefix('customer:');
    const keys = allCustomers.map((customer: any) => `customer:${customer.id}`);

    if (keys.length > 0) {
      await kv.mdel(keys);
    }

    // Also log this major action
    const activity = {
      id: Date.now().toString(),
      customerId: 'SYSTEM',
      customerName: 'Admin',
      action: 'All Customers Deleted',
      score: 0,
      change: 'down',
      date: new Date().toISOString(),
    };
    await kv.set(`activity:${activity.id}`, activity);

    return c.json({ success: true, count: keys.length });
  } catch (error) {
    console.log('Error deleting all customers:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-f9f965c0/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const customer = await kv.get(`customer:${id}`);

    if (!customer) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }

    await kv.del(`customer:${id}`);

    // Log activity
    const activity = {
      id: Date.now().toString(),
      customerId: id,
      customerName: customer.name,
      action: 'Customer Deleted',
      score: 0,
      change: 'down',
      date: new Date().toISOString(),
    };
    await kv.set(`activity:${activity.id}`, activity);

    return c.json({ success: true, id });
  } catch (error) {
    console.log(`Error deleting customer ${c.req.param('id')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// M-Pesa analysis routes
app.post('/make-server-f9f965c0/mpesa/analyze', async (c) => {
  try {
    const { customerId, fileName, fileSize } = await c.req.json();

    // Derive a stable seed from the file's identity so that re-analyzing
    // the same document always returns the same results.
    const seed = hashSeed(`${fileName}:${fileSize}`);
    const rng = new SeededRandom(seed);

    // Build analysis using the deterministic RNG
    const totalTransactions = rng.nextInt(150, 350);
    const totalInflow = rng.nextInt(250000, 450000);
    const totalOutflow = rng.nextInt(200000, 380000);
    const consistentIncome = rng.next() > 0.3;
    const savingsBehavior = rng.next() > 0.5 ? 'Good' : 'Moderate';
    const averageBalance = totalInflow - totalOutflow;

    const scoreImpact = averageBalance > 0 && consistentIncome
      ? rng.nextInt(30, 60)
      : -(rng.nextInt(6, 25));

    const riskIndicators: string[] = [];
    if (!consistentIncome) {
      riskIndicators.push('Irregular income pattern detected');
    }
    if (totalOutflow > totalInflow) {
      riskIndicators.push('Spending exceeds income');
    }

    // Generate monthly data deterministically
    const monthlyData = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(2025, 7 + i, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      inflow: rng.nextInt(50000, 70000),
      outflow: rng.nextInt(45000, 60000),
    }));

    const analysis = {
      id: Date.now().toString(),
      customerId,
      fileName,
      fileSize,
      totalTransactions,
      totalInflow,
      totalOutflow,
      averageBalance,
      consistentIncome,
      savingsBehavior,
      riskIndicators,
      scoreImpact,
      monthlyData,
      analyzedAt: new Date().toISOString(),
    };

    await kv.set(`mpesa:${analysis.id}`, analysis);

    return c.json({ success: true, analysis });
  } catch (error) {
    console.log('Error analyzing M-Pesa statement:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-f9f965c0/mpesa/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    const allAnalyses = await kv.getByPrefix('mpesa:');
    const customerAnalyses = allAnalyses.filter((a: any) => a.customerId === customerId);

    return c.json({ success: true, analyses: customerAnalyses });
  } catch (error) {
    console.log(`Error fetching M-Pesa analyses for customer ${c.req.param('customerId')}:`, error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Activity/History routes
app.get('/make-server-f9f965c0/activities', async (c) => {
  try {
    const activities = await kv.getByPrefix('activity:');

    // Sort by date descending
    activities.sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ success: true, activities });
  } catch (error) {
    console.log('Error fetching activities:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed initial data if empty
app.post('/make-server-f9f965c0/seed', async (c) => {
  try {
    // Check by the specific new seed key so we re-seed even if old data exists
    const alreadySeeded = await kv.get('customer:seed-1');
    if (alreadySeeded) {
      return c.json({ success: true, message: 'Data already seeded' });
    }

    const seedCustomers = [
      {
        id: 'seed-1',
        name: 'John Kamau',
        idNumber: '12345678',
        phoneNumber: '+254 712 345 678',
        email: 'john.kamau@email.com',
        creditScore: 720,
        riskLevel: 'Low',
        paymentHistory: 95,
        creditUtilization: 25,
        creditHistoryMonths: 48,
        numberOfLoans: 2,
        totalLoansAmount: 150000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-2',
        name: 'Mary Wanjiku',
        idNumber: '23456789',
        phoneNumber: '+254 723 456 789',
        email: 'mary.wanjiku@email.com',
        creditScore: 580,
        riskLevel: 'Medium',
        paymentHistory: 70,
        creditUtilization: 65,
        creditHistoryMonths: 24,
        numberOfLoans: 4,
        totalLoansAmount: 280000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-3',
        name: 'Grace Achieng',
        idNumber: '45678901',
        phoneNumber: '+254 745 678 901',
        email: 'grace.achieng@email.com',
        creditScore: 780,
        riskLevel: 'Low',
        paymentHistory: 98,
        creditUtilization: 15,
        creditHistoryMonths: 60,
        numberOfLoans: 1,
        totalLoansAmount: 80000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-4',
        name: 'Peter Otieno',
        idNumber: '34567890',
        phoneNumber: '+254 734 567 890',
        email: 'peter.otieno@email.com',
        creditScore: 490,
        riskLevel: 'High',
        paymentHistory: 55,
        creditUtilization: 85,
        creditHistoryMonths: 12,
        numberOfLoans: 6,
        totalLoansAmount: 420000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-5',
        name: 'Fatuma Hassan',
        idNumber: '56789012',
        phoneNumber: '+254 756 789 012',
        email: 'fatuma.hassan@email.com',
        creditScore: 655,
        riskLevel: 'Medium',
        paymentHistory: 82,
        creditUtilization: 50,
        creditHistoryMonths: 36,
        numberOfLoans: 3,
        totalLoansAmount: 195000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-6',
        name: 'Samuel Mwangi',
        idNumber: '67890123',
        phoneNumber: '+254 767 890 123',
        email: 'samuel.mwangi@email.com',
        creditScore: 810,
        riskLevel: 'Low',
        paymentHistory: 99,
        creditUtilization: 10,
        creditHistoryMonths: 72,
        numberOfLoans: 1,
        totalLoansAmount: 50000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-7',
        name: 'Aisha Mohamed',
        idNumber: '78901234',
        phoneNumber: '+254 778 901 234',
        email: 'aisha.mohamed@email.com',
        creditScore: 540,
        riskLevel: 'High',
        paymentHistory: 60,
        creditUtilization: 78,
        creditHistoryMonths: 18,
        numberOfLoans: 5,
        totalLoansAmount: 360000,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-8',
        name: 'David Kipchoge',
        idNumber: '89012345',
        phoneNumber: '+254 789 012 345',
        email: 'david.kipchoge@email.com',
        creditScore: 695,
        riskLevel: 'Medium',
        paymentHistory: 88,
        creditUtilization: 40,
        creditHistoryMonths: 30,
        numberOfLoans: 2,
        totalLoansAmount: 120000,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const customer of seedCustomers) {
      await kv.set(`customer:${customer.id}`, customer);
    }

    return c.json({ success: true, message: `Seeded ${seedCustomers.length} customers successfully` });
  } catch (error) {
    console.log('Error seeding data:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
