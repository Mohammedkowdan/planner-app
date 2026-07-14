export interface RawLocationData {
  governorate: string;
  district?: string;
  families: number;
  boys: number;
  girls: number;
  men: number;
  women: number;
}

export interface RawProjectData {
  sheetName: string;
  sector: string;
  projectName: string;
  donor?: string;
  brief?: string;
  outputs?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  budget?: number;
  locations: RawLocationData[];
}

export interface ParseResult {
  projects: RawProjectData[];
  issues: {
    severity: 'WARNING' | 'ERROR';
    message: string;
    sheetName?: string;
    rowNumber?: number;
    columnName?: string;
    rawValue?: string;
  }[];
}
