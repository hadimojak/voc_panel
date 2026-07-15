import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class SupersetService {
  private readonly supersetUrl = ConfigService.config.superset.SUPERSET_URL;
  private readonly username = ConfigService.config.superset.SUPERSET_USERNAME;
  private readonly password = ConfigService.config.superset.SUPERSET_PASSWORD;
  private readonly provider = ConfigService.config.superset.SUPERSET_PROVIDER;

  private createClient(cookie = ''): AxiosInstance {
    return axios.create({
      baseURL: this.supersetUrl,
      withCredentials: true,
      headers: cookie ? { Cookie: cookie } : {},
    });
  }

  private extractCookies(setCookieHeaders?: string[]): string {
    if (!setCookieHeaders?.length) {
      return '';
    }

    return setCookieHeaders.map((cookie) => cookie.split(';')[0]).join('; ');
  }

  private mergeCookies(...cookieGroups: string[]): string {
    return cookieGroups.filter(Boolean).join('; ');
  }

  async getAccessToken(): Promise<{ accessToken: string; cookies: string }> {
    const client = this.createClient();

    const response = await client.post(
      '/api/v1/security/login',
      {
        username: this.username,
        password: this.password,
        provider: this.provider,
        refresh: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const accessToken = response.data?.access_token;
    const cookies = this.extractCookies(response.headers['set-cookie']);

    if (!accessToken) {
      throw new InternalServerErrorException('Superset login failed');
    }

    return { accessToken, cookies };
  }

  async getGuestToken(dashboardId: string): Promise<string> {
    const { accessToken, cookies: loginCookies } = await this.getAccessToken();

    const csrfClient = this.createClient(loginCookies);
    const csrfResponse = await csrfClient.get('/api/v1/security/csrf_token/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const csrfToken = csrfResponse.data?.result;
    const csrfCookies = this.extractCookies(csrfResponse.headers['set-cookie']);
    const mergedCookies = this.mergeCookies(loginCookies, csrfCookies);

    if (!csrfToken) {
      throw new InternalServerErrorException(
        'Failed to fetch Superset CSRF token',
      );
    }

    const guestClient = this.createClient(mergedCookies);
    const response = await guestClient.post(
      '/api/v1/security/guest_token/',
      {
        resources: [
          {
            type: 'dashboard',
            id: dashboardId,
          },
        ],
        rls: [],
        user: {
          username: 'embedded-user',
          first_name: 'Embedded',
          last_name: 'User',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json',
          Referer: this.supersetUrl,
        },
      },
    );

    const guestToken = response.data?.token;

    if (!guestToken) {
      throw new InternalServerErrorException(
        'Superset guest token was not returned',
      );
    }

    return guestToken;
  }
}
