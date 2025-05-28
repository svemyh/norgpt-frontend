#!/usr/bin/env typescript
// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Configuration from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.API_KEY;
const MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create the payload for the LLM API
    const payload = {
      model: MODEL_NAME || "",
      messages: [
        {
          role: "system",
          content: "Du er en hjelpsom assistent som svarer på norsk.",
        },
        ...body.messages, // Include messages from the client
      ],
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // timeout length in ms
    
    try {
      // Make the API call with timeout
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY || ""}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      // Clear the timeout since request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error:', errorData);
        return NextResponse.json(
          { 
            error: 'Det oppstod en feil ved kommunikasjon med AI-tjenesten.', 
            errorType: 'api',
            errorMessage: 'Tjenesten kunne ikke behandle forespørselen.'
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      // Clear the timeout if it hasn't fired yet
      clearTimeout(timeoutId);
      
      // Type guard for fetch errors
      const fetchError = error as { name?: string; message?: string };
      
      // Check if this is an AbortError (timeout)
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out after 10 seconds');
        return NextResponse.json(
          { 
            error: 'Forespørselen tok for lang tid.', 
            errorType: 'timeout',
            errorMessage: 'Tjenesten svarte ikke innen tidsfristen. Vennligst prøv igjen senere.'
          },
          { status: 408 } // Request Timeout
        );
      }
      
      // Handle other fetch errors
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Kunne ikke koble til AI-tjenesten.', 
          errorType: 'connection',
          errorMessage: 'Det oppstod et problem med tilkoblingen til tjenesten. Vennligst sjekk internettforbindelsen din.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Det oppstod en serverfeil.' },
      { status: 500 }
    );
  }
}
