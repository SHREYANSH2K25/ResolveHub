import multer from 'multer'

// temporarily hold files in RAM instead of writing to local disk
const storage = multer.memoryStorage();

const upload = multer({
    storage : storage,
    limits : {
        fileSize : 10*1024*1024
    }
}).array('media', 5); // tells multer to expect only 5 files from field named media

export default upload;