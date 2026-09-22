# Synthia Morph Studio v0.1

Phone-first, dark, no-blue morph studio prototype.

What works now:
- Drop/choose a photo.
- Morph presets: Synthia, Terrane, Luminal, Mythic, Furry, Equilibrium.
- Identity-preservation toggle.
- Creature intensity, texture, glow, face shift, fur, scales, circuitry, crest/ears, wings.
- State color.
- Offline local visual preview.
- Save PNG preview.
- Save reproducible morph recipe JSON.

Important:
The local browser preview is a lightweight visual approximation, not a semantic AI image transformation.
For photoreal photo-to-creature generation, connect an image-generation backend to the provider hook.
The recipe object is intentionally provider-neutral so Synthia can own the morphology rules while models remain replaceable.

Open `synthia-morph-studio.html` directly in a browser.
