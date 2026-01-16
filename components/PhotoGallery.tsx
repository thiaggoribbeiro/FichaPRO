
import React, { useState } from 'react';
import { PropertyImage } from '../types';

interface PhotoGalleryProps {
  images: PropertyImage[];
  onAddImages: (files: FileList) => void;
  onAddImageUrl: (url: string) => void;
  onDeleteImage: (id: string) => void;
  onSetCover: (id: string) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images,
  onAddImages,
  onAddImageUrl,
  onDeleteImage,
  onSetCover
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddImages(e.target.files);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onAddImageUrl(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#A64614]">add_a_photo</span>
          <h3 className="text-lg font-bold">Galeria de Fotos</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {images.length} / 20
        </span>
      </div>

      <div className="space-y-4 mb-8">
        {/* Upload Area */}
        <div
          onClick={() => document.getElementById('file-upload')?.click()}
          className="border-2 border-dashed border-[#A64614]/30 bg-[#A64614]/5 hover:bg-[#A64614]/10 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 bg-[#A64614]/20 rounded-full flex items-center justify-center text-[#A64614] mb-3">
            <span className="material-symbols-outlined text-3xl">upload_file</span>
          </div>
          <p className="text-sm font-bold">Arraste e solte fotos aqui</p>
          <p className="text-xs text-slate-500 mt-1">ou <span className="text-[#A64614] underline">clique para selecionar</span></p>
        </div>

        {/* URL Input Toggle */}
        <div className="flex flex-col gap-2">
          {!showUrlInput ? (
            <button
              onClick={() => setShowUrlInput(true)}
              className="text-xs font-bold text-[#A64614] flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              Adicionar por link direto (URL)
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Cole o link da imagem aqui..."
                className="flex-1 text-xs border border-slate-200 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#A64614]"
              />
              <button
                onClick={handleUrlSubmit}
                className="bg-[#A64614] text-white text-xs px-3 py-1 rounded font-bold"
              >
                Add
              </button>
              <button
                onClick={() => setShowUrlInput(false)}
                className="text-slate-400 text-xs hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className={`relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm ${img.isCover ? 'col-span-2 aspect-video' : 'aspect-square'}`}
          >
            {img.isCover && (
              <div className="absolute top-2 left-2 z-10 bg-[#A64614] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                FOTO DE CAPA
              </div>
            )}

            {img.status === 'uploading' ? (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined animate-spin text-slate-300">hourglass_top</span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Enviando...</p>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={img.url}
                  alt="Property"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => onSetCover(img.id)}
                    title="Definir como capa"
                    className={`w-10 h-10 ${img.isCover ? 'bg-yellow-500' : 'bg-white/20'} backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors`}
                  >
                    <span className="material-symbols-outlined">star</span>
                  </button>
                  <button
                    onClick={() => onDeleteImage(img.id)}
                    className="w-10 h-10 bg-red-500/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-2 py-10 text-center border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400">Nenhuma imagem adicionada ainda.</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-900">Dica:</span> Fotos horizontais de alta resolução funcionam melhor para o PDF. Use links diretos para imagens que já estão online.
        </p>
      </div>
    </section>
  );
};

export default PhotoGallery;
