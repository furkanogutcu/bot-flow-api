export interface ISendMailParams {
  to: string;
  context: {
    [key: string]: any;
  };
  subject: string;
  template: string;
}
