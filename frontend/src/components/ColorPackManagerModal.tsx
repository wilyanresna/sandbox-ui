import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { type ColorPack, type ColorToken } from '../types';

interface ColorPackManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditPackId?: string; // Optional: directly open a specific pack for editing (e.g., from Editor)
}

export const ColorPackManagerModal: React.FC<ColorPackManagerModalProps> = ({
  isOpen,
  onClose,
  initialEditPackId,
}) => {
  const {
    colorPacks,
    createColorPack,
    updateColorPack,
    deleteColorPack,
    loading,
    error: storeError,
  } = useProjectStore();

  const [activeView, setActiveView] = useState<'list' | 'edit'>('list');
  const [selectedPack, setSelectedPack] = useState<ColorPack | null>(null);
  const [packName, setPackName] = useState('');
  const [tokens, setTokens] = useState<ColorToken[]>([]);
  const [newPackName, setNewPackName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine initial view if initialEditPackId is provided
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (initialEditPackId) {
        const pack = colorPacks.find((p) => p.id === initialEditPackId);
        if (pack) {
          setSelectedPack(pack);
          setPackName(pack.name);
          setTokens([...pack.tokens]);
          setActiveView('edit');
        } else {
          setActiveView('list');
        }
      } else {
        setActiveView('list');
      }
    }
  }, [isOpen, initialEditPackId, colorPacks]);

  if (!isOpen) return null;

  const handleEditClick = (pack: ColorPack) => {
    setSelectedPack(pack);
    setPackName(pack.name);
    setTokens([...pack.tokens]);
    setActiveView('edit');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleAddPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackName.trim()) return;

    setErrorMessage(null);
    const newPack = await createColorPack(newPackName.trim());
    if (newPack) {
      setNewPackName('');
      setIsAddingNew(false);
      // Auto-open editing view for the newly created color pack
      handleEditClick(newPack);
    } else {
      setErrorMessage(storeError || 'Failed to create color pack');
    }
  };

  const handleDeletePack = async (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (packId === '00000000-0000-0000-0000-000000000001' || packId === '00000000-0000-0000-0000-000000000002') {
      alert('Cannot delete default system color packs.');
      return;
    }

    if (!confirm('Are you sure you want to delete this Color Pack? This action cannot be undone.')) {
      return;
    }

    setErrorMessage(null);
    const result = await deleteColorPack(packId);
    if (result.success) {
      setSuccessMessage('Color Pack deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
      if (selectedPack?.id === packId) {
        setActiveView('list');
        setSelectedPack(null);
      }
    } else {
      setErrorMessage(result.error || 'Failed to delete color pack.');
    }
  };

  const handleTokenColorChange = (
    index: number,
    mode: 'light' | 'dark',
    value: string
  ) => {
    // Ensure formatting has a starting '#'
    let formattedVal = value;
    if (formattedVal && !formattedVal.startsWith('#')) {
      formattedVal = '#' + formattedVal;
    }

    const updated = [...tokens];
    if (mode === 'light') {
      updated[index] = { ...updated[index], lightHex: formattedVal };
    } else {
      updated[index] = { ...updated[index], darkHex: formattedVal };
    }
    setTokens(updated);
  };

  const validateHex = (hex: string): boolean => {
    const reg = /^#[0-9A-Fa-f]{6}$/;
    return reg.test(hex);
  };

  const handleSavePack = async () => {
    if (!selectedPack) return;
    if (!packName.trim()) {
      setErrorMessage('Color Pack name cannot be empty.');
      return;
    }

    // Validate all tokens
    for (const tok of tokens) {
      if (!validateHex(tok.lightHex)) {
        setErrorMessage(`Token "${tok.name}" has an invalid Light Mode Hex color code: ${tok.lightHex}. Use #RRGGBB format.`);
        return;
      }
      if (!validateHex(tok.darkHex)) {
        setErrorMessage(`Token "${tok.name}" has an invalid Dark Mode Hex color code: ${tok.darkHex}. Use #RRGGBB format.`);
        return;
      }
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    const updated = await updateColorPack(selectedPack.id, packName.trim(), tokens);
    if (updated) {
      setSuccessMessage('Color Pack updated successfully! Changes applied in real time.');
      setSelectedPack(updated);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(storeError || 'Failed to update color pack.');
    }
  };

  const isSystemPack = (id: string) => {
    return (
      id === '00000000-0000-0000-0000-000000000001' ||
      id === '00000000-0000-0000-0000-000000000002' ||
      id === 'pack-m3-default' ||
      id === 'pack-forest'
    );
  };

  return (
    <div className="modal-backdrop cp-manager-backdrop">
      <div className="modal-content cp-manager-modal" onClick={(e) => e.stopPropagation()}>
        <header className="cp-modal-header">
          <h2>🎨 Color Pack Manager</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </header>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="cp-modal-body">
          {activeView === 'list' ? (
            <div className="cp-list-view">
              <div className="cp-list-actions">
                {isAddingNew ? (
                  <form onSubmit={handleAddPack} className="add-pack-form">
                    <input
                      type="text"
                      placeholder="Enter Color Pack Name..."
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className="add-pack-buttons">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Create
                      </button>
                      <button
                        type="button"
                        className="btn btn-text btn-sm"
                        onClick={() => setIsAddingNew(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => setIsAddingNew(true)}
                  >
                    + Add New Color Pack
                  </button>
                )}
              </div>

              <div className="cp-packs-scroll-container">
                <div className="cp-packs-list">
                  {colorPacks.map((pack) => {
                    const sys = isSystemPack(pack.id);
                    return (
                      <div
                        key={pack.id}
                        className="cp-pack-item"
                        onClick={() => handleEditClick(pack)}
                      >
                        <div className="cp-pack-info">
                          <span className="cp-pack-name">{pack.name}</span>
                          {sys && <span className="badge badge-system">System Default</span>}
                        </div>
                        <div className="cp-pack-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEditClick(pack)}
                          >
                            ⚙️ Edit Tokens
                          </button>
                          {!sys && (
                            <button
                              className="btn btn-danger btn-sm btn-delete-pack"
                              onClick={(e) => handleDeletePack(pack.id, e)}
                              title="Delete Color Pack"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="cp-edit-view">
              <div className="cp-edit-header">
                <button
                  className="btn btn-text btn-back-to-list"
                  onClick={() => setActiveView('list')}
                >
                  ← Back to List
                </button>
                <div className="cp-pack-rename-group">
                  <label htmlFor="edit-pack-name">Color Pack Name</label>
                  <input
                    id="edit-pack-name"
                    type="text"
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    placeholder="e.g. Dark Lavender Palette"
                    disabled={isSystemPack(selectedPack?.id || '')}
                  />
                </div>
              </div>

              <div className="cp-tokens-container">
                <div className="cp-tokens-header-row">
                  <div className="col-name">Token Name</div>
                  <div className="col-light">Light Mode Variant</div>
                  <div className="col-dark">Dark Mode Variant</div>
                </div>

                <div className="cp-tokens-list">
                  {tokens.map((token, index) => (
                    <div key={token.name} className="cp-token-row">
                      <div className="col-name">
                        <code className="token-code">{token.name}</code>
                      </div>
                      <div className="col-light">
                        <div className="color-picker-wrapper">
                          <input
                            type="color"
                            value={token.lightHex}
                            onChange={(e) =>
                              handleTokenColorChange(index, 'light', e.target.value)
                            }
                            title={`Select Light Mode color for ${token.name}`}
                          />
                          <input
                            type="text"
                            value={token.lightHex}
                            maxLength={7}
                            onChange={(e) =>
                              handleTokenColorChange(index, 'light', e.target.value)
                            }
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                      <div className="col-dark">
                        <div className="color-picker-wrapper">
                          <input
                            type="color"
                            value={token.darkHex}
                            onChange={(e) =>
                              handleTokenColorChange(index, 'dark', e.target.value)
                            }
                            title={`Select Dark Mode color for ${token.name}`}
                          />
                          <input
                            type="text"
                            value={token.darkHex}
                            maxLength={7}
                            onChange={(e) =>
                              handleTokenColorChange(index, 'dark', e.target.value)
                            }
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cp-edit-actions">
                <button className="btn btn-secondary" onClick={() => setActiveView('list')}>
                  Close Editor
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSavePack}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
