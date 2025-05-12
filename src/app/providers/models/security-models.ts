export interface UserToken {
    Token: string;  
    RefreshToken: string;
    Expiration: Date;
    Photo?: Blob;
  }
  
  export interface UserDetails {
    givenName?: string;
    name?: string;    
    email?: string;
    Roles: string[];
    pucture?: any,
  }