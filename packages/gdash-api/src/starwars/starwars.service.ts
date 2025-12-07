import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AxiosError } from 'axios';

@Injectable()
export class StarwarsService {
  private readonly baseUrl = process.env.STARWARS_API_URL || 'https://starwars-databank-server.vercel.app/api/v1';

  constructor(private readonly httpService: HttpService) { }

  async findAll(category: string, page: number = 1, limit: number = 10): Promise<unknown> {
    const url = `${this.baseUrl}/${category}`;

    return lastValueFrom(
      this.httpService.get(url, { params: { page, limit } }).pipe(
        map((response) => response.data as unknown),
        catchError((error: unknown) => {
          const e = error as AxiosError;
          throw new HttpException(
            e.response?.data || 'Failed to fetch data from Star Wars API',
            e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
  }

  async findOne(category: string, id: string): Promise<unknown> {
    const url = `${this.baseUrl}/${category}/${id}`;

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response) => response.data as unknown),
        catchError((error: unknown) => {
          const e = error as AxiosError;
          throw new HttpException(
            e.response?.data || 'Failed to fetch item from Star Wars API',
            e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
  }
}
