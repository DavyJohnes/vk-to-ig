import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import { VK } from 'vk-io';
import { IgApiClient, LocationRepositorySearchResponseVenuesItem } from 'instagram-private-api';
import axios from 'axios';
import sharp from 'sharp';

const IG_MIN_RATIO = 0.8;
const IG_MAX_RATIO = 1.91;

export default class Photos extends Command {
    static description = 'Moves photos from VK to Instagramm'

    static examples = [
        '$ vk-to-ig photos --type wall',
    ]

    static flags = {
        help: flags.help({
            char: 'h',
        }),
        type: flags.enum({
            char: 't',
            description: 'Photos type',
            options: ['wall', 'profile', 'saved'],
            required: true,
        }),
    }

    async run() {
        const { flags } = this.parse(Photos);
        const type = flags.type;

        const VK_USER_ID = await cli.prompt('VK user id');
        const VK_API_TOKEN = await cli.prompt('VK API key');
        const IG_USERNAME = await cli.prompt('Instagram username');
        const IG_PASSWORD = await cli.prompt('Instagram password');

        const vkClient = new VK({
            token: VK_API_TOKEN,
        });

        this.log(`Searching photos of VK user ${VK_USER_ID} with type ${type}`);

        const vkPhotosResponse = await vkClient.api.photos.get({
            owner_id: VK_USER_ID,
            extended: true,
            photo_sizes: true,
            count: 100,
            album_id: type,
        });

        if (!vkPhotosResponse.count) {
            this.error('There is no photos in VK with specified type');
        }

        this.log(`Found ${vkPhotosResponse.count} photos`);

        const photos = vkPhotosResponse.items;

        photos.sort((a, b) => {
            return a.date - b.date;
        });

        const igClient = new IgApiClient();

        igClient.state.generateDevice(IG_USERNAME);

        this.log(`Authorizing in Instagram with username ${IG_USERNAME}`);

        await igClient.account.login(IG_USERNAME, IG_PASSWORD);

        for (const vkPhoto of photos) {
            this.log(`Start processing photo ${vkPhoto.id}...`);

            const vkPhotoSizes = vkPhoto.sizes;

            let location: LocationRepositorySearchResponseVenuesItem | undefined;

            if (!vkPhotoSizes) {
                this.error(`There are no sizes for photo ${vkPhoto.id}`);
            }

            let vkPhotoBestQuality = vkPhotoSizes[0];

            vkPhotoSizes.forEach(photoSize => {
                if (photoSize.height > vkPhotoBestQuality.height) {
                    vkPhotoBestQuality = photoSize;
                }
            });

            this.log(`Best quality is ${vkPhotoBestQuality.width}x${vkPhotoBestQuality.height}`);

            const ratio = vkPhotoBestQuality.width / vkPhotoBestQuality.height;

            this.log(`Ratio is ${ratio}`);

            if (vkPhoto.lat && vkPhoto.long) {
                this.log(`Found geo mark (${vkPhoto.lat}, ${vkPhoto.long}), trying to resolve it using Instagram API...`);

                const searchResults = await igClient.locationSearch.index(vkPhoto.lat, vkPhoto.long);

                if (searchResults.venues.length > 0) {
                    location = searchResults.venues[0];

                    this.log(`Resolved geo mark in Instagram API: ${location.name}, ${location.address}`);
                } else {
                    this.log('Unable to resolve geo mark using Instagram API');
                }
            }

            const vkPhotoUrl = vkPhotoBestQuality.url;

            this.log(`Downloading ${vkPhotoUrl}...`);

            const vkPhotoContentResponse = await axios.get(vkPhotoUrl, {
                responseType: 'arraybuffer',
            });

            let vkPhotoBuffer = vkPhotoContentResponse.data;

            if (!vkPhotoBuffer) {
                this.error(`Unable to download ${vkPhotoUrl}`);
            }

            if (ratio > IG_MAX_RATIO || ratio < IG_MIN_RATIO) {
                this.log('Resizing image to fit IG allowed ratio');

                const targetWidth = Math.round(vkPhotoBestQuality.height * 0.8);
                const targetHeight = Math.round(vkPhotoBestQuality.height);

                this.log(`Target dimensions; ${targetWidth}x${targetHeight}`);

                vkPhotoBuffer = await sharp(vkPhotoBuffer)
                    .resize({
                        width: targetWidth,
                        height: targetHeight,
                        fit: 'cover',
                    }).toBuffer();
            }

            this.log('Uploading to Instagram...');

            await igClient.publish.photo({
                file: vkPhotoBuffer,
                location: location && {
                    name: location.name,
                    lat: vkPhoto.lat!,
                    lng: vkPhoto.long!,
                    external_id_source: location.external_id_source,
                    external_id: location.external_id,
                    address: location.address,
                },
                caption: vkPhoto.text,
            });
        }
    }
}
