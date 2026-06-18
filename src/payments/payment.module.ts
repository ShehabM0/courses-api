import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
  ],
})
export class PaymentModule {}
