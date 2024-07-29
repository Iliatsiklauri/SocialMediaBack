import { ApiProperty } from '@nestjs/swagger';

export class queryParams {
  @ApiProperty()
  page: number;
  @ApiProperty()
  perPage: number;
}
