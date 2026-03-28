.PHONY: setup run build clean

# Set up the repository by installing Node dependencies and Hugo modules
setup:
	hugo mod get -u
	hugo mod tidy
	hugo mod npm pack
	npm install

# Run the Hugo development server with drafts enabled
serve:
	@echo "Starting Hugo development server..."
	hugo server -w --disableFastRender

# Build the Hugo static site for production
build:
	@echo "Building the site..."
	hugo --minify

# Clean up generated files and dependencies
clean:
	@echo "Cleaning up..."
	rm -rf public resources node_modules
