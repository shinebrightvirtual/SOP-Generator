import { useRef } from "react";
import { S } from "../styles/theme.js";

export default function BrandPanel({ brand, setBrand }) {
  const fileRef = useRef(null);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBrand(b => ({ ...b, logo: ev.target.result, logoName: file.name }));
    reader.readAsDataURL(file);
  };

  return (
    <div style={S.card}>
      <div style={S.secNum()}>Brand Customization</div>
      <h3 style={{ ...S.secTitle, fontSize: "17px", marginBottom: "14px" }}>Make it yours</h3>

      <div style={S.fieldGroup}>
        <label style={S.label}>Business Name</label>
        <input
          style={S.input}
          placeholder="Your business name"
          value={brand.businessName}
          onChange={e => setBrand(b => ({ ...b, businessName: e.target.value }))}
        />
      </div>

      <div style={S.fieldGroup}>
        <label style={S.label}>Logo</label>
        <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
        <div style={S.uploadArea} onClick={() => fileRef.current?.click()}>
          {brand.logo ? (
            <div>
              <img src={brand.logo} alt="Logo" style={S.logoPreview} />
              <div style={{ fontSize: "11px", color: "#918B82", marginTop: "4px" }}>{brand.logoName}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "20px", marginBottom: "2px" }}>⬆</div>
              <div style={{ fontSize: "12px", color: "#918B82" }}>Upload your logo</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px" }}>
        <div style={{ ...S.fieldGroup, flex: 1 }}>
          <label style={S.label}>Primary Color</label>
          <div style={S.colorPicker}>
            <input
              type="color"
              value={brand.primaryColor}
              onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))}
              style={{ ...S.colorSwatch(brand.primaryColor), border: "none", padding: 0, cursor: "pointer" }}
            />
            <input
              style={{ ...S.input, flex: 1 }}
              value={brand.primaryColor}
              onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))}
            />
          </div>
        </div>
        <div style={{ ...S.fieldGroup, flex: 1 }}>
          <label style={S.label}>Accent Color</label>
          <div style={S.colorPicker}>
            <input
              type="color"
              value={brand.accentColor}
              onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))}
              style={{ ...S.colorSwatch(brand.accentColor), border: "none", padding: 0, cursor: "pointer" }}
            />
            <input
              style={{ ...S.input, flex: 1 }}
              value={brand.accentColor}
              onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
