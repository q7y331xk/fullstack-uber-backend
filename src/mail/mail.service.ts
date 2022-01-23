import { Response } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions, EmailVar } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    // this.sendEmail('test', 'test', 'q7y331xk@naver.com', [
    //   { key: 'username', value: 'usernameFromBack' },
    //   { key: 'code', value: 'codeFromBack' },
    // ])
    //   .then(() => {
    //     console.log('Message sent');
    //   })
    //   .catch((error) => {
    //     console.log(error.response.body);
    //   });
  }

  private async sendEmail(
    subject: string,
    template: string,
    target: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `Admin User <dulee@${this.options.domain}>`);
    form.append('to', 'dulee.dev@gmail.com');
    form.append('to', target);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVeficitationEmail(email: string, code: string) {
    this.sendEmail('test', 'test', 'q7y331xk@naver.com', [
      { key: 'username', value: 'usernameFromBack' },
      { key: 'code', value: 'codeFromBack' },
    ]);
  }
}
