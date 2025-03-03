// types.ts
export interface Preferences {
    destinationType: string[];
    budget: string;
    duration: string;
    activities: string[];
    locationType:string;
  }

  export type DestinationType = 'Beaches' | 'Adventure' | 'Mountains' | 'Cities' |
    'Cultural' | 'Wildlife' | 'Historical' | 'Rural' | 'Islands' |
    'Deserts' | 'Forests' | 'Lakeside';

  export type BudgetOption = 'Low' | 'Medium' | 'High';

  export type DurationOption = '2-3 days' | '4-5 days' | '6-8 days' | '9-12 days' | '2 weeks+';
