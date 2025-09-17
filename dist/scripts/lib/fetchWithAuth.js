export async function logoutClient() {
    // Perform client-side cleanup if necessary (e.g., clear local state)
    // Make an API call to the server-side logout endpoint
    try {
        const response = await fetch("/api/logout", { method: "POST" });
        if (!response.ok) {
            console.error("Server-side logout failed:", await response.text());
        }
    }
    catch (error) {
        console.error("Error during server-side logout API call:", error);
    }
}
export async function fetchWithAuth(router, input, init) {
    const clonedInit = { ...init };
    // If the body is FormData, ensure Content-Type is not explicitly set
    // The browser will automatically set the correct multipart/form-data header
    if (clonedInit.body instanceof FormData) {
        const headers = new Headers(clonedInit.headers);
        headers.delete("Content-Type");
        clonedInit.headers = headers;
    }
    const response = await fetch(input, clonedInit);
    if (response.status === 401) {
        console.warn("401 Unauthorized: Token expired or invalid. Logging out...");
        await logoutClient(); // Use client-side logout
        router.push("/auth/login");
        throw new Error("Unauthorized");
    }
    return response;
}
