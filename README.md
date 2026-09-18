# Industrial Cybersecurity Dashboard

A frontend implementation of an Industrial / OT Cybersecurity Dashboard and Attack Path experience.

This project was created as part of a frontend and UX design challenge focused on helping security and operations teams understand security posture, risky assets, findings, network zones, and possible attack paths in an industrial environment.

## About the Project

The application provides two main experiences:

- Security Dashboard
- Attack Path Investigation

The dashboard gives a quick overview of the current security situation, while the Attack Path view helps the user understand how an exposure can move through different assets and potentially reach a critical system.

I focused on keeping the interface information-dense but easy to understand, since cybersecurity dashboards can quickly become difficult to navigate when there are many assets and relationships.

## Features

### Dashboard

- Security posture overview
- Critical and high-risk findings
- Exposed critical assets / crown jewels
- High-risk attack paths
- Site and Purdue Zone filters
- Severity and criticality filters
- Time range filtering
- Asset / IP / CVE search
- Attack path preview
- Security and operational context
- Recent changes and system information
- Responsive dashboard layout

### Attack Path

- Source, pivot, target and crown-jewel nodes
- Purdue zone representation
- Directed attack relationships
- Protocol and service information
- Risk and confidence information
- Attack path filtering
- Zoom and fit-to-view controls
- Path highlighting
- Node and edge investigation
- Asset and finding context
- Responsive graph layout

## Technologies Used

This project was built using only:

- HTML5
- CSS3
- Vanilla JavaScript

No frontend frameworks or UI libraries were used.

## Responsive Design

The interface was designed to work across different screen sizes.

I tested the layout for:

- Mobile
- Tablet
- Laptop
- Desktop

The Attack Path experience changes its layout based on the available screen size so that the graph remains readable instead of simply shrinking the entire desktop interface.

## Project Structure

