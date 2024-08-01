import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { extractKeyFromUrl } from 'src/utils';
import { Post } from './entities/post.entity';
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

    //! upload image
    const config = {
      Key: filePath,
      Bucket: this.bucketName,
      Body: file.buffer,
    };

    await this.storageService.putObject(config).promise();
    return filePath;

    //! retrieve image
  }
  async changeImageUrl(posts: Post[]) {
    for (const post of posts) {
      const param = {
        Key: post.imageUrl,
        Bucket: this.bucketName,
      };
      post.filePath = await this.storageService.getSignedUrlPromise(
        'getObject',
        param,
      );
    }
    return posts;
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
