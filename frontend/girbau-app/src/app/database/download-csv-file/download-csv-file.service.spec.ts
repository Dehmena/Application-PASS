import { TestBed } from '@angular/core/testing';

import { DownloadCsvFileService } from './download-csv-file.service';

describe('DownloadCsvFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DownloadCsvFileService = TestBed.get(DownloadCsvFileService);
    expect(service).toBeTruthy();
  });
});
