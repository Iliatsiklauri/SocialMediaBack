import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { extractKeyFromUrl } from 'src/utils';

@Injectable()
export class AwsService {
  private bucketName;
  private storageService;
  constructor() {
    this.bucketName = process.env.BUCKET_NAME;
    this.storageService = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: 'eu-north-1',
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const type = file.mimetype.split('/')[1];
    const filePath = `upload/${new Date().getTime()}.${type}`;

    const config = {
      Key: filePath,
      Bucket: this.bucketName,
      Body: file.buffer,
    };

    await this.storageService.putObject(config).promise();

    const param = {
      Key: filePath,
      Bucket: this.bucketName,
      Expires: 100,
    };
    return this.storageService.getSignedUrlPromise('getObject', param);
  }

  async deleteImage(imageUrl: string) {
    const key = extractKeyFromUrl(imageUrl);
    const config = {
      Key: key,
      Bucket: this.bucketName,
    };

    return this.storageService.deleteObject(config).promise();
  }
}
