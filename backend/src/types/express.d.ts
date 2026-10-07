export interface RequestUser {
  id: string;
  email: string;
  name: string;
  businessId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
