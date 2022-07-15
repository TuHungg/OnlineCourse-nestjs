import { UpdateFileDto } from './../../../resources/files/dto/update-file.dto';
import { VIDEO_THUMBNAIL_DIR } from './../constants/firebase.constant';
import ffmpeg from 'fluent-ffmpeg';
import { TEMP_DIR } from '../constants/app.constant';
import { INVALID_FILE_URL } from './../constants/errors.constant';
import { bucket } from './../firebase/firebase';
import Helper from './helper.helper';
import { TMediaType } from 'src/resources/files/schemas/file.schema';
import { CreateFileDto } from 'src/resources/files/dto/create-file.dto';

export default class FileUploadHelper {
    static async deleteByDownloadUrl(url: string) {
        const path = this.extractPathFromDownloadUrl(url);
        if (path) {
            const file = bucket.file(path);
            return file.delete();
        }
        throw INVALID_FILE_URL;
    }

    // MANIPULATE VIDEOS
    // static async getVideoDuration(url: string) {
    //     const metadata = await this.parseVideo(url)
    //     return metadata.format.duration;
    // }

    static async takeVideoScreenShot(url: string) {
        const [picPath] = await this.genThumbnail(url, `${TEMP_DIR}/${VIDEO_THUMBNAIL_DIR}`, [
            '00:00:01.000',
        ]);
        const fileName = this.genRandomFileName(VIDEO_THUMBNAIL_DIR, 'png');
        const res = await bucket.upload(picPath, {
            destination: fileName,
        });
        const downloadUrl = this.createDownloadUrl(res[0].id);
        return downloadUrl;
    }

    private static createDownloadUrl(fileId: string) {
        return `https://firebasestorage.googleapis.com/v0/b/onlinecourse-704d6.appspot.com/o/${fileId}?alt=media`;
    }

    private static async genThumbnail(
        url: string,
        dirPath: string,
        timemarks: string[],
        size = '1280x720'
    ): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let filenamesResult;
            ffmpeg(url)
                .on('filenames', function (filenames) {
                    filenamesResult = filenames?.map((name) => `${dirPath}/${name}`);
                })
                .on('end', function () {
                    resolve(filenamesResult);
                })
                .on('error', function (err) {
                    console.error('an error happened: ' + err.message);
                    reject(err);
                })
                .takeScreenshots({ count: 1, timemarks, size }, dirPath);
        });
    }

    // PARSE
    static parseVideo(url: string): Promise<ffmpeg.FfprobeData> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(url, function (err, metadata) {
                if (err) return reject(err);
                resolve(metadata);
            });
        });
    }
    // HELPER METHODS
    private static extractPathFromDownloadUrl(url: string): string | undefined {
        const decodeUrl = Helper.decodeUrl(url);
        const match = decodeUrl.match(/firebasestorage.*\/o\/(.*)\?/);
        if (match) {
            return match[1];
        }
        return undefined;
    }

    private static genRandomFileName(dirPath: string, ext: string): string {
        const randomName = Helper.lodash.padStart(
            Math.floor(Math.random() * Math.pow(10, 10)) + '',
            10,
            '0'
        );
        return `${dirPath}/${randomName}.${ext}`;
    }

    static getMediaType(type: string): TMediaType {
        return type.split('/')[0] as TMediaType;
    }

    static async processingVideo(data: UpdateFileDto): Promise<UpdateFileDto> {
        const processData = Helper.lodash.clone(data);
        const metadata = await FileUploadHelper.parseVideo(processData.url);
        const thumbnailUrl = await FileUploadHelper.takeVideoScreenShot(processData.url);
        processData.duration = metadata.format.duration;
        processData.thumbnailUrl = thumbnailUrl;
        return processData;
    }
}
