import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
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

  //! upload image
  async uploadImage(file: Express.Multer.File) {
    const type = file.mimetype.split('/')[1];
    const filePath = `upload/${new Date().getTime()}.${type}`;
    const imageUrl = `https://dv8x7zx2zd79g.cloudfront.net/${filePath}`;

    const config = {
      Key: filePath,
      Bucket: this.bucketName,
      Body: file.buffer,
    };

    await this.storageService.putObject(config).promise();
    return { imageUrl, filePath };
  }

  //! delete image

  async deleteImage(filePath: string) {
    const config = {
      Key: filePath,
      Bucket: this.bucketName,
    };

    return this.storageService.deleteObject(config).promise();
  }
}
