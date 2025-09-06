import { useCallback } from "react";

const useProcessFile = () => {
  const acceptedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

  // Filter valid image files based on accepted types
  const processFile = useCallback((files) => {
    const validFiles = files.filter((file) => acceptedImageTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      alert("Some files are invalid or unsupported. Only JPEG, JPG, and PNG are allowed.");
    }
    return validFiles; // Return valid image files
  }, []);

  // Convert valid image files to Object URLs
  const convertFilesToObjectURL = useCallback((files) => {
    return files.map((file) => URL.createObjectURL(file)); // Return Object URLs
  }, []);

  // Main method to process and convert files
  const handleFiles = useCallback((files) => {
    const validFiles = processFile(files); // Filter valid files
    const objectURLs = convertFilesToObjectURL(validFiles); // Convert to Object URLs
    return { validFiles, objectURLs }; // Return both valid files and their Object URLs
  }, [processFile, convertFilesToObjectURL]);

  return { handleFiles, processFile, convertFilesToObjectURL };
};

export default (useProcessFile);