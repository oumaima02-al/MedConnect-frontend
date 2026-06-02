import { useRef, useState } from 'react';

function UploadCard({ id, label, side, file, preview, onFile, error }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFile(selected);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#374151' }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </span>

      <div
        id={id}
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        style={{
          border: `2px dashed ${error ? '#fca5a5' : preview ? '#2ecc71' : '#d1d5db'}`,
          borderRadius: 14,
          background: preview ? '#f0fdf4' : error ? '#fff7f7' : '#fafafa',
          minHeight: 180, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
          overflow: 'hidden',
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={`Aperçu ${label}`}
              style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'contain' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              ✓ {file?.name}
            </span>
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500, marginBottom: 4 }}>
                Cliquez ou déposez votre fichier
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>PNG, JPG, WEBP · max 5 Mo</p>
            </div>
          </>
        )}

        {preview && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 26, height: 26, borderRadius: '50%',
              background: '#ef444418', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {error && (
        <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function DocumentUpload({ files, previews, onFile, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: 'linear-gradient(135deg,#fffbeb,#fef9c3)',
        border: '1px solid #fde68a', borderRadius: 12,
        padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5 }}>
          Veuillez téléverser les deux faces de votre document professionnel. Les images doivent être <strong>claires et lisibles</strong>.
          Les fichiers sont chiffrés et stockés de manière sécurisée.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <UploadCard
          id="bp-doc-front"
          label="Recto du document"
          side="FRONT"
          file={files.cardFrontImage}
          preview={previews.cardFrontImage}
          onFile={(f) => onFile('cardFrontImage', f)}
          error={errors?.cardFrontImage}
        />
        <UploadCard
          id="bp-doc-back"
          label="Verso du document"
          side="BACK"
          file={files.cardBackImage}
          preview={previews.cardBackImage}
          onFile={(f) => onFile('cardBackImage', f)}
          error={errors?.cardBackImage}
        />
      </div>
    </div>
  );
}
