import { z } from 'zod';

// User authentication schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  business_name: z.string().min(2, 'Business name is required').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Analysis input schema
export const analysisSchema = z.object({
  scenario_name: z.string().min(3, 'Scenario name must be at least 3 characters'),
  description: z.string().optional(),
  cost_price: z.number().min(0.01, 'Cost price must be greater than 0'),
  selling_price: z.number().min(0.01, 'Selling price must be greater than 0'),
  units_sold: z.number().int().min(1, 'Units sold must be at least 1'),
  discount_percentage: z.number().min(0, 'Discount must be between 0 and 100').max(100, 'Discount must be between 0 and 100'),
  units_sold_discount: z.number().int().min(1, 'Discounted units must be at least 1'),
  fixed_cost: z.number().min(0, 'Fixed cost cannot be negative').optional().default(0),
  variable_cost: z.number().min(0, 'Variable cost cannot be negative').optional().default(0),
  competitor_price: z.number().min(0, 'Competitor price cannot be negative').optional(),
  time_period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
}).refine((data) => data.selling_price > data.cost_price, {
  message: 'Selling price must be greater than cost price',
  path: ['selling_price'],
});