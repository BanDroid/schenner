export type Platform = {
  platformName: string;
  getSchedulePageURL: (
    username: string,
    extraParams?: string | object | unknown
  ) => string;
};
