import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const ENDPOINT = process.env.AZUREAI_ENDPOINT_URL || '';
const API_KEY = process.env.AZUREAI_ENDPOINT_KEY || '';

const azureCredential = new AzureKeyCredential(API_KEY);

const azure = ModelClient(ENDPOINT, azureCredential);

export default azure;
