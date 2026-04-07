'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Check, ExternalLink, Loader2, ImageIcon } from 'lucide-react';

interface Photo {
  id: string;
  baseUrl: string;
  width: number;
  height: number;
  description: string | null;
  creationTime: string | null;
}

export function AlbumGallery({ albumUrl }: { albumUrl: string | null }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchPhotos = useCallback(async (pageToken?: string) => {
    const isMore = !!pageToken;
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (pageToken) params.set('pageToken', pageToken);

      const res = await fetch(`/api/google-photos/photos?${params}`);
      if (!res.ok) throw new Error('Erreur de chargement');

      const data = await res.json();

      if (isMore) {
        setPhotos((prev) => [...prev, ...data.photos]);
      } else {
        setPhotos(data.photos);
      }
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      console.error('Fetch photos error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <div className="mt-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]">
          Photos de couple
        </p>
        <div className="flex items-center gap-3">
          {albumUrl && (
            <a
              href={albumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#d4bbff] transition-colors hover:text-[#ffadf9]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir sur Google Photos
            </a>
          )}
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-5 py-2 text-xs font-bold text-[#37003a] transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Ajouter des photos
          </button>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && photos.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-[2rem] bg-white/5 backdrop-blur-[12px] border border-white/[0.08] p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f263c]">
            <ImageIcon className="h-8 w-8 text-[#d7c0d1]" />
          </div>
          <p className="mt-4 text-sm text-[#d7c0d1] max-w-xs">
            Aucune photo dans l&apos;album. Ajoutez vos premi&egrave;res photos
            ensemble !
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-6 py-2.5 text-xs font-bold text-[#37003a] transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Ajouter des photos
          </button>
        </div>
      )}

      {/* Photos grid */}
      {!loading && photos.length > 0 && (
        <>
          <div className="mt-6 columns-2 gap-3 space-y-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid rounded-2xl bg-white/5 backdrop-blur-[12px] border border-white/[0.08] overflow-hidden group transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={`${photo.baseUrl}=w600-h600`}
                  alt={photo.description || 'Photo de couple'}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  style={{
                    aspectRatio:
                      photo.width && photo.height
                        ? `${photo.width}/${photo.height}`
                        : 'auto',
                  }}
                />
              </div>
            ))}
          </div>

          {nextPageToken && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchPhotos(nextPageToken)}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/5 px-6 py-2.5 text-xs font-medium text-[#ecddfb] transition-all hover:bg-white/10 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Charger plus
              </button>
            </div>
          )}
        </>
      )}

      {/* Photo picker dialog */}
      {pickerOpen && (
        <PhotoPicker
          onClose={() => setPickerOpen(false)}
          onAdded={() => {
            setPickerOpen(false);
            fetchPhotos();
          }}
        />
      )}
    </div>
  );
}

function PhotoPicker({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const fetchUserPhotos = useCallback(async (pageToken?: string) => {
    const isMore = !!pageToken;
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (pageToken) params.set('pageToken', pageToken);

      const res = await fetch(`/api/google-photos/user-photos?${params}`);
      if (!res.ok) throw new Error('Erreur de chargement');

      const data = await res.json();

      if (isMore) {
        setPhotos((prev) => [...prev, ...data.photos]);
      } else {
        setPhotos(data.photos);
      }
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      console.error('Fetch user photos error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPhotos();
  }, [fetchUserPhotos]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setAdding(true);

    try {
      const res = await fetch('/api/google-photos/add-to-album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaItemIds: Array.from(selected) }),
      });

      if (!res.ok) throw new Error('Erreur lors de l\'ajout');
      onAdded();
    } catch (err) {
      console.error('Add photos error:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-[#21172d] border border-white/[0.08] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <h3 className="text-base font-semibold text-[#ecddfb]">
            Choisir des photos
          </h3>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <span className="text-xs text-[#ffadf9]">
                {selected.size} s&eacute;lectionn&eacute;e{selected.size > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#d7c0d1] transition-colors hover:bg-white/10 hover:text-[#ffadf9]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Photos grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          )}

          {!loading && photos.length === 0 && (
            <p className="py-8 text-center text-sm text-[#d7c0d1]">
              Aucune photo trouv&eacute;e dans votre biblioth&egrave;que.
            </p>
          )}

          {!loading && photos.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => {
                  const isSelected = selected.has(photo.id);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => toggleSelect(photo.id)}
                      className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#ffadf9] ring-2 ring-[#ffadf9]/30'
                          : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <img
                        src={`${photo.baseUrl}=w300-h300-c`}
                        alt={photo.description || 'Photo'}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffadf9]">
                            <Check className="h-4 w-4 text-[#37003a]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {nextPageToken && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => fetchUserPhotos(nextPageToken)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/5 px-5 py-2 text-xs font-medium text-[#ecddfb] transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Charger plus
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-6 py-4">
          <button
            onClick={handleAdd}
            disabled={selected.size === 0 || adding}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-6 py-3 text-sm font-bold text-[#37003a] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Ajouter {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
