import * as path from 'path';

export const rootDirectory = path.join(__dirname, '../../../');
export const applicationsPath = path.join(rootDirectory, 'applications');

export const distJavascript = path.join(__dirname, '../../client/');
export const distHtml = path.join(__dirname, '../../../client/');