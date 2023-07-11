import { Injectable } from '@angular/core';
import { File, Http, knownFolders, path } from '@nativescript/core';
import { Zip } from '@nativescript/zip';
import {
  Downloader,
  ProgressEventData,
  DownloadEventData,
} from '@triniwiz/nativescript-downloader';
import { TensorflowBaseService } from '~/app/core/services/tensorflow.base-service';

@Injectable({
  providedIn: 'root',
})
export class Experiment1Service extends TensorflowBaseService {
  downloadAndUnzipDataset() {
    const tempFolder = knownFolders.temp();
    const zipFile = path.join(tempFolder.path, 'kagglecatsanddogs_5340.zip');
    const datasetFolder = path.join(tempFolder.path, 'PetImages');
    if (File.exists(zipFile)) {
      console.log('Zip file already exists. Skipping download...');
      this.unzipDataset(zipFile, datasetFolder);
    } else {
      console.log('Downloading dataset...');
      const downloader = new Downloader();
      const datasetDownloadId = downloader.createDownload({
        url: 'https://download.microsoft.com/download/3/E/1/3E1C3F21-ECDB-4869-8368-6DEBA77B919F/kagglecatsanddogs_5340.zip',
        path: tempFolder.path,
        fileName: 'kagglecatsanddogs_5340.zip',
      });
      downloader
        .start(datasetDownloadId, (progressData: ProgressEventData) => {
          console.log(`Download progress: ${progressData.value}%`);
        })
        .then((completed: DownloadEventData) => {
          console.log('Download complete.');
          this.unzipDataset(zipFile, datasetFolder);
        })
        .catch((error) => {
          console.error('Error during download: ', error);
        });
    }
  }

  unzipDataset(zipFile, datasetFolder) {
    console.log('Unzipping...');
    Zip.unzip({
      archive: zipFile,
      directory: datasetFolder,
      onProgress: (percent) => {
        console.log(`Unzip progress: ${percent}%`);
      },
    })
      .then(() => {
        console.log('Unzipping complete.');
      })
      .catch((error) => {
        console.error('Error during unzipping: ', error);
      });
  }
}
