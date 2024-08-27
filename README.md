# Medusa Firebase Plugin

A Medusa plugin to enable file uploads and management using Firebase Cloud Storage.

## Features

* Upload files directly to Firebase Cloud Storage.
* Retrieve file URLs and presigned URLs for secure access.
* Stream-based file upload support.
* Supports both public and private file storage.

## Installation

To install the plugin, use npm or yarn:

```bash
npm install medusa-firebase
```

## Configuration

In your Medusa project's configuration file (e.g., `medusa-config.js`), add the `medusa-firebase` plugin to the `plugins` array:

```js
module.exports = {
  // Other configurations...
  plugins: [
    // Other plugins...
    {
      resolve: 'medusa-firebase',
      options: {
        sservice_account_key: process.env.FIREBASE_CRED,
        bucket_name: process.env.STORAGE_BUCKET,
        upload_dir: process.env.UPLOAD_DIR || "uploads",
      },
    },
  ],
};
```

### Options

* `service_account_key`: The path to your Firebase service account key JSON file. This file is used to authenticate with Firebase.
* `bucket_name`: The name of your Firebase Storage bucket.
* `upload_dir`: The dir to upload the file to.


## Usage

Once configured, the `medusa-firebase` plugin allows you to upload and manage files using Firebase Cloud Storage.

### Example: Upload a File

```typescript
import { FileService } from '@medusajs/medusa';

const fileService = new FileService();

// Example file data (Multer format)
const fileData = {
  path: './path/to/file.jpg',
  originalname: 'file.jpg',
  mimetype: 'image/jpeg',
};

// Upload the file
const result = await fileService.upload(fileData);

console.log('Uploaded file URL:', result.url);
```

## Development

If you want to contribute to this plugin or make local changes, clone the repository and install the dependencies:

```bash
git clone https://github.com/teebarg/medusa-firebase.git
cd medusa-firebase
npm install
```

## Building the Plugin

To build the TypeScript files, run:

```bash
npm run build
```

## Testing

You can test the plugin by linking it to a Medusa project:

```bash
npm link
cd /path/to/your/medusa-project
npm link medusa-firebase
```

## License

MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Support

If you have any questions or need help, feel free to open an issue in this repository.