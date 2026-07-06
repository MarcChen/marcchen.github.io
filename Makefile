.PHONY: help dev build optimize copy-photos upload clean

help: ## Show available targets
	@echo "Available targets:"
	@echo "  dev            - Start development server"
	@echo "  build          - Build for production (runs prebuild hooks + postbuild redirect fix)"
	@echo "  optimize       - Optimize images in public/images/"
	@echo "  copy-photos    - Copy photos/ to public/photos/ and generate manifest"
	@echo "  upload         - Upload all images (public/images/ + photos/) to Cloudinary"
	@echo "  clean          - Remove build artifacts"

dev:
	npm run dev

build:
	npm run build

optimize:
	npm run images:optimize

copy-photos:
	node scripts/copy-photos.mjs

# The upload script defaults to --all when no flag is passed, so this single
# target uploads both public/images/ and photos/ in one pass. Granular flags
# (--photos / --images) still exist on the underlying script if ever needed.
upload:
	npm run images:upload

clean:
	rm -rf .next out
