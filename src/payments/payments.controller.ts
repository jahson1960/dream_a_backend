import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Res, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import type { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key/api-key.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate_transaction')
  @UseGuards(ApiKeyGuard)
  async initiateTransaction(
    //@Body('api_key') api_key: string,
    @Body('username') username: string,
    @Body('account_number') account_number: string,
    @Body('email') email: string,
    @Body('amount') amount: number,
    @Body('currency_code') currency_code: string,
    @Body('country_code') country_code: string,
    @Body('client_callback_url') client_callback_url: string) {
    return this.paymentsService.validateAndCreateReference(
      //api_key,
      username,
      account_number,
      email,
      Number(amount),
      currency_code,
      country_code,
      client_callback_url
    );
  }

  /* @Get('validate_user')
  async validateUserGet(
    @Query('api_key') api_key: string,
    @Query('username') username: string,
    @Query('account_number') account_number: string,
    @Query('email') email: string,
    @Query('amount') amount: number,
    @Query('currency_code') currency_code: string,
    @Query('country_code') country_code: string,
    @Query('client_callback_url') client_callback_url: string,
  ) {
    return this.paymentsService.validateAndCreateReference(
      api_key,
      username,
      account_number,
      email,
      Number(amount),
      currency_code,
      country_code,
      client_callback_url
    );
  } */

  /* @Post('initialize')
  async initialize(@Body() dto: InitPaymentDto, @Res() res: Response) {
    try {
      const resp = await this.paymentsService.initializeWithValidation(dto as any);
      if (resp && resp.status && resp.data && resp.data.authorization_url) {
        // Redirect user to checkout
        return res.redirect(resp.data.authorization_url);
      }
      return res.status(502).json({ status: false, message: 'Paystack initialization failed', raw: resp });
    } catch (err) {
      const status = err.status || HttpStatus.BAD_GATEWAY;
      const message = err.message || 'Paystack initialize failed';
      return res.status(status).json({ status: false, message });
    }
  } */

  @Post('perform_transaction')
  @UseGuards(ApiKeyGuard)
  async performTransaction(
    //@Body('api_key') api_key: string,
    @Body('reference') reference: string,
    //@Body('callback_url') callback_url: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.performTransaction(
      //api_key, 
      reference);
    
    if (result.checkout_url) {
      
      console.log('RESULT:', result); 
      return res.status(200).json({
        status: true,
        checkout_url: result.checkout_url,
      });
    }

    return res.status(400).json(result);
  }

  /*@Post('perform_transaction_flutterwave')
  @UseGuards(ApiKeyGuard)
  async performTransaction_flutterwave(
    @Body('reference') reference: string,
  ) {
    return await this.paymentsService.performTransaction_flutterwave(reference);
  }*/

  @Post('perform_transaction_flutterwave')
  @UseGuards(ApiKeyGuard)
  async performTransactionFlutterwave(
    @Body('reference') reference: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentsService.performTransaction_flutterwave(reference);

    if (!result.status) {
      return res.status(400).json(result);
    }

    // 🔥 encode config
    //const encoded = Buffer.from(JSON.stringify(result.data)).toString('base64');
    const encoded = Buffer.from(JSON.stringify(result.data)).toString("base64");

    return res.redirect(
      `${process.env.FRONTEND_PAYMENT_URL}?ref=${encodeURIComponent(encoded)}`
    );
  }

  @Get('verify_gateway_payment/:reference')
  async verify(@Param('reference') reference: string) {
    return this.paymentsService.verifyAndPersist(reference);
  }

  @Post('verify_transaction')
  @UseGuards(ApiKeyGuard)
  async verifyTransaction(
    @Body('reference') reference: string,
  ){
    return this.paymentsService.verifyTransaction(
      //api_key, 
      reference);
  }

  // Paystack may redirect with query params like ?trxref=...&reference=...
   @Get('verify_gateway_payment')
  async verifyQuery(@Query('reference') reference?: string, @Query('trxref') trxref?: string) {
    const ref = reference || trxref;
    if (!ref) {
      throw new HttpException('Reference missing', HttpStatus.BAD_REQUEST);
    }
    return this.paymentsService.verifyAndPersist(ref);
  }

  // Make & Verify flutterwave payment
  @Post('make_payment')
  async verifyPayment(@Body() paymentData: any) {
    console.log("🔥 CONTROLLER HIT:", paymentData);
    return await this.paymentsService.verifyFlutterwavePayment(paymentData);
  }

  

  /*=========================
   LIST CLIENT TRANSACTIONS
  ========================= */
  @Post('transactions/client')
  @UseGuards(ApiKeyGuard)
  async listClientTransactions(
    @Body('account_number') account_number: string,
    @Body('start_date') start_date: string,
    @Body('end_date') end_date: string,
  ) {
    return this.paymentsService.listClientTransactions(
      account_number,
      start_date,
      end_date,
    );
  }

  /*=========================
   CLIENT TOTAL DEPOSITS
  =========================*/
  @Post('transactions/client-total')
  @UseGuards(ApiKeyGuard)
  async clientTotalDeposits(
    @Body('account_number') account_number: string,
  ) {
    return this.paymentsService.clientTotalDeposits(account_number);
  }

  /*=========================
   LIST ALL TRANSACTIONS (DATE RANGE)
  =========================*/
  @Post('transactions/all')
  @UseGuards(ApiKeyGuard)
  async listAllTransactions(
    @Body('start_date') start_date: string,
    @Body('end_date') end_date: string,
  ) {
    return this.paymentsService.listAllTransactions(
      start_date,
      end_date,
    );
  }

  /*=========================
   CUMULATIVE DEPOSITS (ALL TIME)
  =========================*/
  @Post('transactions/cumulative')
  @UseGuards(ApiKeyGuard)
  async cumulativeDeposits() {
    return this.paymentsService.cumulativeDeposits();
  }

  /*=========================
   CUMULATIVE DEPOSITS (DATE RANGE)
  =========================*/
  @Post('transactions/cumulative-range')
  @UseGuards(ApiKeyGuard)
  async cumulativeDepositsByDateRange(
    @Body('start_date') start_date: string,
    @Body('end_date') end_date: string,
  ) {
    return this.paymentsService.cumulativeDepositsByDateRange(
      start_date,
      end_date,
    );
  }

  /*=========================
   SEARCH BY REFERENCE
  =========================*/
  @Post('transactions/reference')
  @UseGuards(ApiKeyGuard)
  async listTransactionByReference(
    @Body('reference') reference: string,
  ) {
    return this.paymentsService.listTransactionByReference(reference);
  }

  /*=========================
   CUSTOMER ACCOUNT BALANCE
   =========================*/
  @Post('customer_balance')
  @UseGuards(ApiKeyGuard)
  async getCustomerBalance(
    @Body('account_number') account_number: string,
  ) {
    return this.paymentsService.getCustomerBalance(account_number);
  }

  /*=========================
   CUMULATIVE ACCOUNT BALANCE
   =========================*/
  @Post('cumulative_balance')
  @UseGuards(ApiKeyGuard)
  async getCumulativeBalance() {
    return this.paymentsService.getCumulativeBalance();
  }

  @Post('get_payment_config')
  @UseGuards(ApiKeyGuard)
  async getPaymentConfig(
    @Body('reference') reference: string,
  ) {
    return await this.paymentsService.getPaymentConfig(reference);
  }

 }
