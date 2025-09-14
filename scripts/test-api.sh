#!/bin/bash

# Test script for Guardz URL Fetcher Service
# This script provides various test functions for the API

SERVER_URL="http://34.135.82.223:8080/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Guardz URL Fetcher Service Test Script${NC}"
echo "================================================"

# Function to test basic URL fetching
test_basic_urls() {
    echo -e "\n${YELLOW}📝 Test 1: Basic URL Fetching${NC}"
    echo "Testing with JSON and XML endpoints..."
    
    curl -X POST -H "Content-Type: application/json" \
        -d '{"urls": ["https://httpbin.org/json", "https://httpbin.org/xml"]}' \
        "$SERVER_URL/urls/fetch" | jq '.'
}

# Function to test error handling
test_error_handling() {
    echo -e "\n${YELLOW}📝 Test 2: Error Handling${NC}"
    echo "Testing with invalid URLs..."
    
    curl -X POST -H "Content-Type: application/json" \
        -d '{"urls": ["https://invalid-url-that-does-not-exist.com", "https://httpbin.org/status/404"]}' \
        "$SERVER_URL/urls/fetch" | jq '.'
}

# Function to test multiple URLs
test_multiple_urls() {
    echo -e "\n${YELLOW}📝 Test 3: Multiple URLs${NC}"
    echo "Testing with 5 different URLs..."
    
    curl -X POST -H "Content-Type: application/json" \
        -d '{
            "urls": [
                "https://httpbin.org/json",
                "https://httpbin.org/xml", 
                "https://httpbin.org/html",
                "https://httpbin.org/robots.txt",
                "https://httpbin.org/user-agent"
            ]
        }' \
        "$SERVER_URL/urls/fetch" | jq '.'
}

# Function to test real-world URLs
test_real_world_urls() {
    echo -e "\n${YELLOW}📝 Test 4: Real-world URLs${NC}"
    echo "Testing with real websites..."
    
    curl -X POST -H "Content-Type: application/json" \
        -d '{
            "urls": [
                "https://api.github.com/users/octocat",
                "https://jsonplaceholder.typicode.com/posts/1",
                "https://httpbin.org/headers"
            ]
        }' \
        "$SERVER_URL/urls/fetch" | jq '.'
}

# Function to get all results
get_all_results() {
    echo -e "\n${YELLOW}📊 Getting All Results${NC}"
    curl -s "$SERVER_URL/urls" | jq '.'
}

# Function to get service status
get_status() {
    echo -e "\n${YELLOW}📊 Service Status${NC}"
    curl -s "$SERVER_URL/urls/status" | jq '.'
}

# Function to test custom URLs
test_custom_urls() {
    echo -e "\n${YELLOW}📝 Test 5: Custom URLs${NC}"
    echo "Enter URLs to test (separated by spaces):"
    read -p "URLs: " urls
    
    # Convert space-separated URLs to JSON array
    url_array=$(echo "$urls" | tr ' ' '\n' | jq -R . | jq -s .)
    
    curl -X POST -H "Content-Type: application/json" \
        -d "{\"urls\": $url_array}" \
        "$SERVER_URL/urls/fetch" | jq '.'
}

# Main menu
show_menu() {
    echo -e "\n${BLUE}Choose a test to run:${NC}"
    echo "1. Basic URL Fetching (JSON + XML)"
    echo "2. Error Handling (Invalid URLs)"
    echo "3. Multiple URLs (5 URLs)"
    echo "4. Real-world URLs (GitHub, JSONPlaceholder)"
    echo "5. Custom URLs (Enter your own)"
    echo "6. Get All Results"
    echo "7. Get Service Status"
    echo "8. Run All Tests"
    echo "9. Exit"
    echo -n "Enter your choice (1-9): "
}

# Run all tests
run_all_tests() {
    echo -e "\n${GREEN}🔄 Running All Tests${NC}"
    test_basic_urls
    test_error_handling
    test_multiple_urls
    test_real_world_urls
    get_all_results
    get_status
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is not installed. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y jq
    else
        echo -e "${RED}Please install jq manually: https://stedolan.github.io/jq/${NC}"
        exit 1
    fi
fi

# Main loop
while true; do
    show_menu
    read choice
    
    case $choice in
        1) test_basic_urls ;;
        2) test_error_handling ;;
        3) test_multiple_urls ;;
        4) test_real_world_urls ;;
        5) test_custom_urls ;;
        6) get_all_results ;;
        7) get_status ;;
        8) run_all_tests ;;
        9) echo -e "${GREEN}👋 Goodbye!${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
    esac
    
    echo -e "\n${BLUE}Press Enter to continue...${NC}"
    read
done
