// MongoDB initialization script - runs once on first start
db = db.getSiblingDB('sugarcane_three_tier');

// Create users collection with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'phone', 'password'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        phone: { bsonType: 'string', pattern: '^[0-9]{10}$' },
        password: { bsonType: 'string', minLength: 8 },
        village: { bsonType: 'string' },
        language: { bsonType: 'string', enum: ['en', 'kn', 'hi', 'mr', 'ta', 'te'] }
      }
    }
  }
});

db.users.createIndex({ phone: 1 }, { unique: true });

print('Database initialized: sugarcane_three_tier');
