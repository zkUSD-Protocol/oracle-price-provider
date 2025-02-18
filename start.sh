cat > start.sh << EOL
#!/bin/sh

# Start the Node.js application
yarn start
EOL

chmod +x start.sh

echo -e "${GREEN}Docker setup completed! You can now build and run the container.${NC}"