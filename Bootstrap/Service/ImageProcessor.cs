using System;
using System.IO;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Vidyano.Service.Repository;

namespace Bootstrap.Service
{
    public static class ImageProcessor
    {
        public static void Fix(PersistentObjectAttribute attr, int maxDimensions = 200)
        {
            if (!attr.IsValueChanged)
                return;

            var data = (byte[])attr;
            if (data == null) // TODO: Or wrong image extension...
                return;

            attr.SetValue(Fix(data, maxDimensions));
        }

        public static byte[] Fix(byte[] data, int maxDimensions = 200)
        {
            var bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.StreamSource = new MemoryStream(data);
            bmp.EndInit();

            var rotation = 0;
            try
            {
                var jpegDecoder = new JpegBitmapDecoder(new MemoryStream(data), BitmapCreateOptions.None, BitmapCacheOption.None);
                var r = Convert.ToInt32(((BitmapMetadata)jpegDecoder.Frames[0].Metadata).GetQuery("/app1/ifd/exif:{uint=274}"));
                if (r == 3)
                    rotation = 180;
                else if (r == 8)
                    rotation = 270;
                else if (r == 6)
                    rotation = 90;
            }
            catch { }

            var source = (BitmapSource)bmp;
            if (source.CanFreeze)
                source.Freeze();

            var pixelWidth = source.PixelWidth;
            var pixelHeight = source.PixelHeight;
            var resize = pixelWidth > maxDimensions || pixelHeight > maxDimensions;
            if (resize)
            {
                // NOTE: Resize image first
                var scale = pixelWidth > pixelHeight ? (double)pixelWidth / maxDimensions : (double)pixelHeight / maxDimensions;
                var scaledWidth = (int)(pixelWidth / scale);
                var scaledHeight = (int)(pixelHeight / scale);

                var group = new DrawingGroup();
                RenderOptions.SetBitmapScalingMode(group, BitmapScalingMode.HighQuality);
                group.Children.Add(new ImageDrawing(source, new Rect(0, 0, scaledWidth, scaledHeight)));

                var drawingVisual = new DrawingVisual();
                using (var drawingContext = drawingVisual.RenderOpen())
                    drawingContext.DrawDrawing(group);

                var resizedImage = new RenderTargetBitmap(scaledWidth, scaledHeight, 96, 96, PixelFormats.Default);
                resizedImage.Render(drawingVisual);

                source = resizedImage;

                if (rotation > 0)
                {
                    var rotatedBitmap = new TransformedBitmap();
                    rotatedBitmap.BeginInit();
                    rotatedBitmap.Source = source;
                    rotatedBitmap.Transform = new RotateTransform(rotation);
                    rotatedBitmap.EndInit();

                    source = rotatedBitmap;
                }
            }

            // NOTE: Save as both png/jpg and use smallest size
            var pngEncoder = new PngBitmapEncoder();
            pngEncoder.Frames.Add(BitmapFrame.Create(source));
            var pngStream = new MemoryStream();
            pngEncoder.Save(pngStream);

            if (HasTransparentPixels(source))
                return resize || pngStream.Length < data.Length ? pngStream.ToArray() : data;

            var jpgEncoder = new JpegBitmapEncoder { QualityLevel = 100 };
            jpgEncoder.Frames.Add(BitmapFrame.Create(source));
            var jpgStream = new MemoryStream();
            jpgEncoder.Save(jpgStream);

            // Use smallest (or original)
            if (pngStream.Length < jpgStream.Length)
                return resize || pngStream.Length < data.Length ? pngStream.ToArray() : data;

            return resize || jpgStream.Length < data.Length ? jpgStream.ToArray() : data;
        }

        public static byte[] ResizeImage(byte[] image, int maxDimensions)
        {
            var bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.StreamSource = new MemoryStream(image);
            bmp.EndInit();

            var source = (BitmapSource)bmp;
            if (source.CanFreeze)
                source.Freeze();

            var pixelWidth = source.PixelWidth;
            var pixelHeight = source.PixelHeight;
            var scale = pixelWidth > pixelHeight ? (double)pixelWidth / maxDimensions : (double)pixelHeight / maxDimensions;
            var scaledWidth = (int)(pixelWidth / scale);
            var scaledHeight = (int)(pixelHeight / scale);

            var group = new DrawingGroup();
            RenderOptions.SetBitmapScalingMode(group, BitmapScalingMode.HighQuality);
            group.Children.Add(new ImageDrawing(source, new Rect(0, 0, scaledWidth, scaledHeight)));

            var drawingVisual = new DrawingVisual();
            using (var drawingContext = drawingVisual.RenderOpen())
                drawingContext.DrawDrawing(group);

            var resizedImage = new RenderTargetBitmap(scaledWidth, scaledHeight, 96, 96, PixelFormats.Default);
            resizedImage.Render(drawingVisual);

            source = resizedImage;

            var pngEncoder = new PngBitmapEncoder();
            pngEncoder.Frames.Add(BitmapFrame.Create(source));
            var pngStream = new MemoryStream();
            pngEncoder.Save(pngStream);

            if (HasTransparentPixels(source))
                return pngStream.ToArray();

            var jpgEncoder = new JpegBitmapEncoder { QualityLevel = 100 };
            jpgEncoder.Frames.Add(BitmapFrame.Create(source));
            var jpgStream = new MemoryStream();
            jpgEncoder.Save(jpgStream);

            // Use smallest
            return pngStream.Length < jpgStream.Length ? pngStream.ToArray() : jpgStream.ToArray();
        }

        private static unsafe bool HasTransparentPixels(BitmapSource source)
        {
            var width = source.PixelWidth;
            var height = source.PixelHeight;
            var result = new byte[height * width * 4];

            fixed (byte* buffer = &result[0])
                source.CopyPixels(
                  new Int32Rect(0, 0, source.PixelWidth, source.PixelHeight),
                  (IntPtr)(buffer),
                  height * width * 4,
                  width * 4);

            for (var x = 0; x < width; x++)
            {
                for (var y = 0; y < height; y++)
                {
                    if (result[(y * width + x) * 4 + 3] < 255)
                        return true;
                }
            }

            return false;
        }
    }
}