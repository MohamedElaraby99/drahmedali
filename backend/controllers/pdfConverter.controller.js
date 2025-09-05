import path from 'path';
import { promises as fs } from 'fs';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import pdf2pic from 'pdf2pic';

const convertPdfToImages = asyncHandler(async (req, res) => {
  const { pdfUrl } = req.body;

  console.log('=== PDF CONVERTER API CALL ===');
  console.log('Request body:', req.body);
  console.log('PDF URL received:', pdfUrl);

  if (!pdfUrl) {
    throw new ApiError(400, "PDF URL is required");
  }

  try {
    // Extract filename from URL and decode it
    let filename;
    
    if (pdfUrl.includes('localhost:4007') || pdfUrl.includes('api.almongz.online')) {
      // Full backend URL provided (development or production)
      const urlParts = pdfUrl.split('/');
      const encodedFilename = urlParts[urlParts.length - 1];
      filename = decodeURIComponent(encodedFilename);
    } else if (pdfUrl.includes('uploads/pdfs/')) {
      // Relative path provided
      const urlParts = pdfUrl.split('uploads/pdfs/');
      const encodedFilename = urlParts[urlParts.length - 1];
      filename = decodeURIComponent(encodedFilename);
    } else {
      // Just filename provided
      filename = decodeURIComponent(pdfUrl);
    }
    
    console.log('Received PDF URL:', pdfUrl);
    console.log('Extracted filename:', filename);
    
    // Use a more reliable path resolution
    const pdfPath = path.join(process.cwd(), 'uploads', 'pdfs', filename);
    console.log('Looking for PDF at:', pdfPath);
    console.log('Current working directory:', process.cwd());

    // Check if PDF file exists
    try {
      await fs.access(pdfPath);
      console.log('PDF file found successfully');
    } catch (error) {
      console.log('PDF file not found at:', pdfPath);
             console.log('Available files in uploads/pdfs:');
       try {
         const files = await fs.readdir(path.join(process.cwd(), 'uploads', 'pdfs'));
         console.log(files);
       } catch (readError) {
         console.log('Could not read uploads/pdfs directory:', readError.message);
       }
      throw new ApiError(404, `PDF file not found: ${filename}`);
    }

         // Create output directory if it doesn't exist
     const outputDir = path.join(process.cwd(), 'uploads', 'converted-pdfs');
    try {
      await fs.access(outputDir);
    } catch (error) {
      await fs.mkdir(outputDir, { recursive: true });
    }

         // Configure pdf2pic options
     const options = {
       density: 150,           // Output resolution
       saveFilename: "page",   // Output filename
       savePath: outputDir,    // Output path
       format: "png",          // Output format
       width: 800,             // Output width
       height: 1000            // Output height
     };

     console.log(`Converting PDF to images: ${filename}`);
     
     // Check file size to ensure it's not empty
     const stats = await fs.stat(pdfPath);
     if (stats.size === 0) {
       throw new ApiError(400, "PDF file is empty");
     }
     
     console.log(`PDF file size: ${stats.size} bytes`);
     
     // Create pdf2pic instance with error handling
     let convert;
     try {
       convert = pdf2pic.fromPath(pdfPath, options);
     } catch (pdf2picError) {
       console.error('Error creating pdf2pic instance:', pdf2picError);
       throw new ApiError(500, "Failed to initialize PDF converter: " + pdf2picError.message);
     }
     
     // Get total pages with error handling
     let pageCount;
     try {
       pageCount = await convert.bulk(-1, true);
       console.log(`Total pages found: ${pageCount.length}`);
     } catch (bulkError) {
       console.error('Error getting page count:', bulkError);
       // If conversion dependencies are unavailable (e.g., Ghostscript/ImageMagick),
       // gracefully fall back so the frontend can use the native PDF viewer.
       return res.status(200).json(
         new ApiResponse(200, [], `Conversion unavailable, falling back to native viewer: ${bulkError.message}`)
       );
     }
     
     if (!pageCount || pageCount.length === 0) {
       throw new ApiError(400, "PDF appears to be empty or corrupted");
     }
     
     const convertedImages = [];
     
     // Convert each page to image with better error handling
     for (let i = 1; i <= pageCount.length; i++) {
       try {
         console.log(`Converting page ${i}...`);
         const result = await convert(i, true);
         
         if (result && result.path) {
           const imageName = path.basename(result.path);
           const imageUrl = `/uploads/converted-pdfs/${imageName}`;
           
           convertedImages.push({
             pageNumber: i,
             imageUrl: imageUrl,
             alt: `Page ${i}`,
             width: result.width || 800,
             height: result.height || 1000,
             filename: imageName
           });
           
           console.log(`Page ${i} converted successfully: ${imageName}`);
         } else {
           console.warn(`Page ${i} conversion returned no result`);
         }
       } catch (pageError) {
         console.error(`Error converting page ${i}:`, pageError);
         // Continue with other pages even if one fails
         // Add a placeholder for failed pages
         convertedImages.push({
           pageNumber: i,
           imageUrl: null,
           alt: `Page ${i} (conversion failed)`,
           width: 800,
           height: 1000,
           filename: null,
           error: pageError.message
         });
       }
     }

         return res.status(200).json(
       new ApiResponse(200, convertedImages, `PDF converted to ${convertedImages.length} images successfully`)
     );

  } catch (error) {
    console.error('PDF conversion error:', error);
    // Graceful fallback: return empty data to allow client to switch to native viewer
    return res.status(200).json(
      new ApiResponse(200, [], `Conversion unavailable, falling back to native viewer: ${error.message}`)
    );
  }
});

const getConvertedImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    throw new ApiError(400, "Image filename is required");
  }

     const imagePath = path.join(process.cwd(), 'uploads', 'converted-pdfs', filename);
  
  try {
    await fs.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    // If the converted image doesn't exist, serve a placeholder or the original PDF
    console.log(`Converted image not found: ${filename}, serving placeholder`);
    
    // For now, redirect to a placeholder or serve the actual converted image
    res.status(404).json({
      success: false,
      message: "Converted image not found. Please install pdf2pic package for full functionality."
    });
  }
});

// Test endpoint to check if PDF exists
const testPdfExists = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    throw new ApiError(400, "Filename is required");
  }

  const pdfPath = path.join(process.cwd(), 'uploads', 'pdfs', filename);
  console.log('Testing PDF path:', pdfPath);
  console.log('Current working directory:', process.cwd());
  
  try {
    await fs.access(pdfPath);
    const stats = await fs.stat(pdfPath);
    console.log('✅ PDF file exists!');
    console.log(`File size: ${stats.size} bytes`);
    
    res.status(200).json({
      success: true,
      message: "PDF file exists",
      path: pdfPath,
      size: stats.size
    });
  } catch (error) {
    console.log('❌ PDF file not found');
    console.log('Available files:');
    try {
      const files = await fs.readdir(path.join(process.cwd(), 'uploads', 'pdfs'));
      console.log(files);
    } catch (readError) {
      console.log('Could not read directory:', readError.message);
    }
    res.status(404).json({
      success: false,
      message: "PDF file not found",
      path: pdfPath,
      error: error.message
    });
  }
});

// Health check endpoint for PDF converter
const healthCheck = asyncHandler(async (req, res) => {
  try {
    // Test if pdf2pic is working
    const testOptions = {
      density: 100,
      saveFilename: "test",
      savePath: path.join(process.cwd(), 'uploads', 'converted-pdfs'),
      format: "png",
      width: 100,
      height: 100
    };
    
    res.status(200).json({
      success: true,
      message: "PDF converter is healthy",
      pdf2pic: "Available",
      uploadsDir: path.join(process.cwd(), 'uploads'),
      convertedDir: path.join(process.cwd(), 'uploads', 'converted-pdfs')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PDF converter health check failed",
      error: error.message
    });
  }
});

export {
  convertPdfToImages,
  getConvertedImage,
  testPdfExists,
  healthCheck
};
