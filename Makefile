.PHONY: help dev build optimize copy-photos upload upload-images upload-photos clean

help: ## Show available targets
	@echo "Available targets:"
	@echo "  dev            - Start development server"
	@echo "  build          - Build for production"
	@echo "  optimize       - Optimize images in public/images/"
	@echo "  copy-photos    - Copy photos/ to public/photos/ and generate manifest"
	@echo "  upload         - Upload ALL images (photos + existing) to Cloudinary"
	@echo "  upload-photos  - Upload photos/ to Cloudinary"
	@echo "  upload-images  - Upload public/images/ to Cloudinary"
	@echo "  clean          - Remove build artifacts"

dev:
	npm run dev

build:
	npm run build

optimize:
	npm run images:optimize

copy-photos:
	node scripts/copy-photos.mjs

upload-photos:
	node scripts/upload-to-cloudinary.mjs --photos

upload-images:
	npm run images:upload

upload: upload-images upload-photos

clean:
	rm -rf .next out
