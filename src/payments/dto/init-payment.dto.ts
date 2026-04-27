export class InitPaymentDto {
  username!: string;
  account_number!: string;
  email!: string;
  amount!: number;
  currency_code!: string;
  country_code!: string;
  callback_url!: string;
}
