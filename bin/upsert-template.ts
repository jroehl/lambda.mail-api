import { SES } from 'aws-sdk';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Logger } from '../src/libs/utils';

config();

const {
  AWS_SES_REGION,
  AWS_REGION,
  TEMPLATE_NAME = 'default-template',
} = process.env;

const ses = new SES({ region: AWS_SES_REGION || AWS_REGION });

const getTemplate = (fileEnding) =>
  readFileSync(
    resolve(__dirname, '..', 'templates', `${TEMPLATE_NAME}.${fileEnding}`),
    'utf-8'
  );

const params: SES.UpdateTemplateRequest = {
  Template: {
    ...JSON.parse(getTemplate('json')),
    HtmlPart: getTemplate('html'),
    TextPart: getTemplate('txt'),
  },
};

const updateTemplate = async (params: SES.UpdateTemplateRequest) => {
  Logger.log('Attempting to update existing template.');
  const res = await ses.updateTemplate(params).promise();
  return { method: 'updateTemplate', ...res };
};

const createTemplate = async (params: SES.UpdateTemplateRequest) => {
  Logger.log('Attempting to create new template.');
  const res = await ses.createTemplate(params).promise();
  return { method: 'createTemplate', ...res };
};

const upsert = async () => {
  try {
    const res = await updateTemplate(params);
    return res;
  } catch (error) {
    if (error.code !== 'TemplateDoesNotExist') throw error;
    Logger.log(error.message);
    return createTemplate(params);
  }
};

upsert().then(Logger.log).catch(Logger.error);
