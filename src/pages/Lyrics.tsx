import React, { useState, useEffect } from 'react';
import MusicMatrixBackground from '../components/MusicMatrixBackground';
import API_URL from '../config';
import { Lyric } from '../types';
import './Lyrics.css';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

interface EditingSong {
  id?: number;
  title: string;
  lyrics: string;
}

const Lyrics: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newSong, setNewSong] = useState<EditingSong>({ title: '', lyrics: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingSong, setEditingSong] = useState<EditingSong>({ title: '', lyrics: '' });
  const [songs, setSongs] = useState<Lyric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanningFor, setScanningFor] = useState<'new' | 'edit' | null>(null);

  // Configure PDF.js worker - using local file from public folder
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/libs/pdf.worker.min.mjs';
  }, []);

  // Fetch lyrics from database
  useEffect(() => {
    fetchLyrics();
  }, []);

  const fetchLyrics = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/lyrics`);
      const data: Lyric[] = await response.json();
      setSongs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit'): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      // Handle different file types
      if (fileType.startsWith('image/')) {
        // Image files - use OCR
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setScanImage(imageData);
          setScanningFor(target);
        };
        reader.readAsDataURL(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        // Plain text files
        await processTextFile(file, target);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // PDF files
        await processPDFFile(file, target);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        // Word DOCX files
        await processWordFile(file, target);
      } else {
        alert('Unsupported file type. Please upload: Images, TXT, PDF, or DOCX files.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process the file. Please try again.');
    }
  };

  const processTextFile = async (file: File, target: 'new' | 'edit'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (target === 'new') {
          setNewSong({ ...newSong, lyrics: text.trim() });
        } else {
          setEditingSong({ ...editingSong, lyrics: text.trim() });
        }
        alert('Text file imported successfully!');
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  };

  const processPDFFile = async (file: File, target: 'new' | 'edit'): Promise<void> => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      console.log('Starting PDF processing...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('File read as ArrayBuffer, size:', arrayBuffer.byteLength);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      console.log('Loading PDF document...');

      const pdf = await loadingTask.promise;
      console.log('PDF loaded, pages:', pdf.numPages);

      let fullText = '';
      let hasEmbeddedText = false;

      // First, try to extract embedded text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        setScanProgress(Math.round((i / pdf.numPages) * 50)); // First 50% for text extraction attempt
        console.log(`Checking page ${i} for embedded text...`);

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();

        if (pageText.length > 0) {
          hasEmbeddedText = true;
          fullText += pageText + '\n\n';
          console.log(`Page ${i} has embedded text, length:`, pageText.length);
        }
      }

      console.log('Total embedded text length:', fullText.length);

      // If no embedded text found, use OCR on the PDF pages
      if (!hasEmbeddedText || fullText.trim().length < 10) {
        console.log('No embedded text found or too little text. Using OCR...');
        alert('This PDF contains images. Using OCR to extract text. This may take a moment...');

        fullText = ''; // Reset
        const worker = await createWorker('eng', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const overallProgress = 50 + (m.progress * 50); // Last 50% for OCR
              setScanProgress(Math.round(overallProgress));
            }
          }
        });

        // Process each page with OCR
        for (let i = 1; i <= pdf.numPages; i++) {
          console.log(`Running OCR on page ${i} of ${pdf.numPages}`);
          const page = await pdf.getPage(i);

          // Render page to canvas
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            await page.render(renderContext as any).promise;

            // Convert canvas to image data URL
            const imageData = canvas.toDataURL('image/png');

            // Run OCR on the page image
            const { data: { text } } = await worker.recognize(imageData);
            fullText += text.trim() + '\n\n';
            console.log(`Page ${i} OCR completed, text length:`, text.length);
          }
        }

        await worker.terminate();
        console.log('OCR processing complete');
      }

      console.log('Final text length:', fullText.length);

      if (target === 'new') {
        setNewSong({ ...newSong, lyrics: fullText.trim() });
      } else {
        setEditingSong({ ...editingSong, lyrics: fullText.trim() });
      }

      alert('PDF imported successfully!');
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const processWordFile = async (file: File, target: 'new' | 'edit'): Promise<void> => {
    setIsScanning(true);
    setScanProgress(50);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      if (target === 'new') {
        setNewSong({ ...newSong, lyrics: text.trim() });
      } else {
        setEditingSong({ ...editingSong, lyrics: text.trim() });
      }

      alert('Word document imported successfully!');
    } catch (error) {
      console.error('Error processing Word document:', error);
      alert('Failed to extract text from Word document');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const processOCR = async (): Promise<void> => {
    if (!scanImage || !scanningFor) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(scanImage);
      await worker.terminate();

      // Auto-populate the appropriate form
      if (scanningFor === 'new') {
        setNewSong({ ...newSong, lyrics: text.trim() });
      } else if (scanningFor === 'edit') {
        setEditingSong({ ...editingSong, lyrics: text.trim() });
      }

      alert('Text extracted successfully! Review and edit as needed.');
      setScanImage(null);
      setIsScanning(false);
      setScanProgress(0);
      setScanningFor(null);
    } catch (error) {
      console.error('Error processing OCR:', error);
      alert('Failed to extract text from image');
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const cancelScan = (): void => {
    setScanImage(null);
    setIsScanning(false);
    setScanProgress(0);
    setScanningFor(null);
  };

  const ADMIN_PASSWORD = '$Aragorn60';

  const nextPage = (): void => {
    if (currentPage < songs.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdmin(true);
      setPassword('');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleAddSong = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (newSong.title && newSong.lyrics) {
      try {
        const response = await fetch(`${API_URL}/lyrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSong)
        });
        if (response.ok) {
          await fetchLyrics();
          setNewSong({ title: '', lyrics: '' });
          alert('Song added successfully!');
        }
      } catch (error) {
        console.error('Error adding song:', error);
        alert('Failed to add song');
      }
    }
  };

  const handleEditClick = (index: number): void => {
    setEditingIndex(index);
    setEditingSong({ ...songs[index] });
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (editingSong.title && editingSong.lyrics && editingSong.id) {
      try {
        const response = await fetch(`${API_URL}/lyrics/${editingSong.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSong)
        });
        if (response.ok) {
          await fetchLyrics();
          setEditingIndex(null);
          setEditingSong({ title: '', lyrics: '' });
          alert('Song updated successfully!');
        }
      } catch (error) {
        console.error('Error updating song:', error);
        alert('Failed to update song');
      }
    }
  };

  const handleCancelEdit = (): void => {
    setEditingIndex(null);
    setEditingSong({ title: '', lyrics: '' });
  };

  const handleDeleteSong = async (index: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        const songId = songs[index].id;
        const response = await fetch(`${API_URL}/lyrics/${songId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchLyrics();
          if (currentPage >= songs.length - 1 && currentPage > 0) {
            setCurrentPage(currentPage - 1);
          }
          alert('Song deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting song:', error);
        alert('Failed to delete song');
      }
    }
  };

  return (
    <div className="lyrics-page">
      <MusicMatrixBackground />
      <h2>Lyrics Notebook</h2>

      {!isAdmin && (
        <button className="admin-toggle" onClick={() => setShowAdmin(!showAdmin)}>
          {showAdmin ? 'Hide Admin' : 'Admin Login'}
        </button>
      )}

      {showAdmin && !isAdmin && (
        <form className="admin-login" onSubmit={handleAdminLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      )}

      {isAdmin && editingIndex === null && (
        <div className="admin-panel">
          <h3>Add New Song</h3>
          <form onSubmit={handleAddSong}>
            <input
              type="text"
              placeholder="Song Title"
              value={newSong.title}
              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              required
            />
            <div className="scan-document-section">
              <label className="scan-label">Import Document (Optional):</label>
              <input
                type="file"
                accept="image/*,.txt,.pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => handleFileUpload(e, 'new')}
                className="file-input"
              />
              <small>Upload images (JPG, PNG), text files (TXT), PDFs, or Word documents (DOCX)</small>
            </div>
            <textarea
              placeholder="Song Lyrics"
              value={newSong.lyrics}
              onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
              rows={10}
              required
            />
            <button type="submit">Add Song</button>
            <button type="button" onClick={() => setIsAdmin(false)}>Close Admin</button>
          </form>
        </div>
      )}

      {isAdmin && editingIndex !== null && (
        <div className="admin-panel">
          <h3>Edit Song</h3>
          <form onSubmit={handleSaveEdit}>
            <input
              type="text"
              placeholder="Song Title"
              value={editingSong.title}
              onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
              required
            />
            <div className="scan-document-section">
              <label className="scan-label">Import Document (Optional):</label>
              <input
                type="file"
                accept="image/*,.txt,.pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => handleFileUpload(e, 'edit')}
                className="file-input"
              />
              <small>Upload images (JPG, PNG), text files (TXT), PDFs, or Word documents (DOCX)</small>
            </div>
            <textarea
              placeholder="Song Lyrics"
              value={editingSong.lyrics}
              onChange={(e) => setEditingSong({ ...editingSong, lyrics: e.target.value })}
              rows={10}
              required
            />
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          </form>
        </div>
      )}

      {scanImage && (
        <div className="scan-modal">
          <div className="scan-modal-content">
            <h3>Document Preview</h3>
            <div className="image-preview">
              <img src={scanImage} alt="Scanned document" />
            </div>
            {isScanning && (
              <div className="scan-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <p>Processing... {scanProgress}%</p>
              </div>
            )}
            {!isScanning && (
              <div className="scan-actions">
                <button onClick={processOCR} className="process-btn">
                  Extract Text from Image
                </button>
                <button onClick={cancelScan} className="cancel-btn">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="notebook">
        <div className="notebook-cover">
          <div className="notebook-spine"></div>
        </div>

        <div className="notebook-page left-page">
          <div className="page-lines">
            <h3>{songs[currentPage]?.title}</h3>
            <pre className="lyrics-text">{songs[currentPage]?.lyrics}</pre>
            {isAdmin && (
              <div className="song-actions">
                <button
                  className="edit-song-btn"
                  onClick={() => handleEditClick(currentPage)}
                >
                  Edit Song
                </button>
                <button
                  className="delete-song-btn"
                  onClick={() => handleDeleteSong(currentPage)}
                >
                  Delete Song
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="page-navigation">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="page-btn prev-btn"
          >
            ← Previous
          </button>
          <span className="page-number">
            Page {currentPage + 1} of {songs.length}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === songs.length - 1}
            className="page-btn next-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lyrics;
