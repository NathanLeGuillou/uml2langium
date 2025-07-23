# **uml2langium**

## Project Description

The main goal of this project is to facilitate the automatic generation of the Langium semantic model (abstract syntax) from UML models, thereby simplifying the creation of DSLs (Domain-Specific Languages) based on existing UML diagrams.  
Langium is a framework for building DSLs, offering automatic handling of both abstract and concrete syntax.

## How It Works

- The project takes a UML file exported in XMI format as input.
- It analyzes and converts UML elements (interfaces, classes, attributes, associations, etc.) into a Langium abstract syntax representation.
- The output is a `.langium` file describing the abstract syntax, ready to be extended with concrete syntax.

## Features

- Parsing and analysis of UML models  
- Conversion of UML classes and interfaces into Langium interfaces  
- Mapping of UML primitive types to Langium types  
- Support for UML associations as attributes in Langium  
- Support for UML enumerations converted to Langium types  
- Support for inheritance (UML generalizations)  
- Automatic generation of the Langium grammar file  
- Simple Command Line Interface (CLI) with input/output options  
- Error handling for files and arguments  

## Installation

<pre> 
git clone https://github.com/NathanLeGuillou/uml2langium
npm install
  
</pre>
---

### **Usages / Examples**

<pre> 
uml2langium generate --input "path/to/umlFile/fileName.uml" --output "path/to/output/fileName.langium"

# or with short flags:
uml2langium generate -i "path/to/umlFile/fileName.uml" -o "path/to/output/fileName.langium"

  
</pre> 

## Technologies Used

- **TypeScript** — main programming language  

- **Node.js** — JavaScript runtime environment  

- **Langium** — framework for defining languages and generating grammars  

- **Nunjucks** — template engine for generating Langium code  

- **Minimist** — CLI argument parser  

- **Vitest** — unit testing framework  

- **Chalk** — console text styling for CLI logs  

- **fs (File System)** — Node.js native module for file operations

- **XMI / UML** — input format (XMI), UML as the transformation source  