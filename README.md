# 🖼️ Image to Text Converter

A beautiful and powerful React application that extracts text from images using advanced Gemeni API technology. Built with modern web technologies and featuring a sleek dark theme.

## ✨ Features

- 🎯 **Drag & Drop Interface** - Easy file upload with drag and drop support
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Dark Theme** - Beautiful dark UI with smooth animations
- 🔍 **Advanced AI** - Powered by Gemeni API for accurate text extraction
- 📊 **Real-time Statistics** - Character, word, and line count analytics
- 📋 **Copy & Download** - Easy text export options
- ⚡ **Fast Processing** - Quick image processing with loading indicators
- 🎪 **Smooth Animations** - Elegant transitions and hover effects

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### Installation & Running

1. **Navigate to Project Directory**
   ```bash
   cd image-to-text-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Open Your Browser**
   - The app will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, manually navigate to the URL shown in your terminal

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Next.js** - Fast build tool and dev server
- **Gemeni API** - Artificial Intelligence
- **CSS3, Tailwind 4** - Modern styling with gradients and animations

## 📋 How to Use

### Step 1: Upload an Image
- **Drag and drop** an image file into the upload area, or
- **Click "Browse Images"** to select a file from your device

### Step 2: Preview the Image
- See a preview of your uploaded image
- Supported formats: JPG, PNG, BMP, GIF, WEBP

### Step 3: Extract Text
- Click the **"Extract Text"** button
- Wait for the Ai processing to complete
- The app will automatically scroll to show your results

### Step 4: Use Your Text
- **Copy** the extracted text to clipboard
- **Download** as a text file
- View **statistics** in the sidebar

## 🎯 Supported Image Formats

| Format | Support | Best For |
|--------|---------|----------|
| **JPG/JPEG** | ✅ Excellent | Photos, documents |
| **PNG** | ✅ Excellent | Screenshots, graphics |
| **BMP** | ✅ Good | Windows bitmaps |
| **GIF** | ✅ Good | Simple graphics |
| **WEBP** | ✅ Good | Web images |

## 🌟 Tips for Best Results

1. **Image Quality**: Use clear, high-resolution images
2. **Text Contrast**: Ensure good contrast between text and background
3. **Font Size**: Larger, clearer fonts work better
4. **Image Orientation**: Keep text horizontal for best accuracy
5. **File Size**: Optimal file size is 1-5MB

## 🐛 Troubleshooting

### Common Issues

**❌ "Failed to load resource" errors**
- Clear your browser cache
- Restart the development server
- Check your internet connection

**❌ Text extraction is slow**
- Reduce image file size
- Use simpler images with less background noise
- Check your internet connection for Tesseract.js loading

**❌ App won't start**
- Ensure Node.js version 14+ is installed
- Run \`npm install\` to install dependencies
- Check if port 5173 is available

**❌ Mobile scrolling issues**
- The app automatically scrolls to results on mobile
- Ensure you're using a modern browser

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Fix dependency issues
rm -rf node_modules package-lock.json
npm install
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)