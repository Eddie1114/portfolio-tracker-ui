import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Initialize MongoDB client
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri || '');

// Helper function to connect to database
async function connectToDatabase() {
  if (!client.connect) {
    await client.connect();
  }
  return client.db('portfolio-tracker');
}

// GET /api/portfolio - Get all portfolio items
export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('portfolio');
    const items = await collection.find({}).toArray();
    
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Add a new portfolio item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { asset, quantity, purchasePrice } = body;

    if (!asset || !quantity || !purchasePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('portfolio');
    
    const result = await collection.insertOne({
      asset,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add portfolio item' },
      { status: 500 }
    );
  }
} 