'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CollapsibleSpan from './collapsiblespan';

//const fs = require('fs');

//period > date > events

const Mermaid = dynamic(() => import('@/components/mermaid'), { ssr: false });

export default function Editor() {
  const [mermaidChart, setMermaidChart] = useState(`timeline
    title Timeline of Industrial Revolution
    section 17th-20th century
        Industry 1.0 : Machinery, Water power, Steam power
        Industry 1.0 : 2Machinery, Water power, Steam power
        Industry 2.0 : Electricity, Internal combustion engine, Mass production
        Industry 3.0 : Electronics, Computers, Automation
    section 21st century
        Industry 4.0 : Internet, Robotics, Internet of Things
        Industry 5.0 : Artificial intelligence, Big data, 3D printing
  `);
  const [title, setTitle] = useState("Default")

  const [section, setSection] = useState([])

  const [event, setEvents] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [toItem, setToItem] = useState([]);
  const [arrowText, setArrowText] = useState('');

  const [arrowList, setArrowList] = useState([]);

  useEffect(() => {
    if(arrowList.length == 0){
      //Set to default
      setMermaidChart(`timeline
    title Timeline of Industrial Revolution
    section 17th-20th century
        Industry 1.0 : Machinery, Water power, Steam power
                     : Machinery, Water power, Steam power
        Industry 2.0 : Electricity, Internal combustion engine, Mass production
        Industry 3.0 : Electronics, Computers, Automation
    section 21st century
        Industry 4.0 : Internet, Robotics, Internet of Things
        Industry 5.0 : Artificial intelligence, Big data, 3D printing

      `)
      return
    }
    let text = `timtline
      `
    text += 'tilte' + title + ` 
    `
    for (let arrows of arrowList) {
      text += " " + arrows + " ";
    }
    setMermaidChart(text)
  }, [arrowList])

  const change = (e) => {
    setMermaidChart(e.target.value);
  };

  const addItem = () => {
    if (inputValue.trim()) {
      setEvents([...event, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index) => {
    setEvents(event.filter((_, i) => i !== index));
  };

  const removeArrowList = (index) => {
    setArrowList(arrowList.filter((_, i) => i !== index));
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
  
    // If dropped in the same list, reorder within the same list
    if (source.droppableId.includes('event-list') && destination.droppableId.includes('event-list')) {
      const reorderedEvents = Array.from(event);
      const [removed] = reorderedEvents.splice(source.index, 1);
      reorderedEvents.splice(destination.index, 0, removed);
      setEvent(reorderedEvents);
    }else if (source.droppableId.includes('arrow-list') && destination.droppableId.includes('arrow-list')) {
      const reorderedArrows = Array.from(arrowList);
      const [removed] = reorderedArrows.splice(source.index, 1);
      reorderedArrows.splice(destination.index, 0, removed);
      setArrowList(reorderedArrows);
    }else{
      console.log("Cross list move denided")
    }

  };

  const addArrow = () => {
    if (selectedItem && toItem && arrowText.trim()) {
      setArrowList([...arrowList, [ selectedItem, toItem, arrowText.trim()]]);
      setArrowText('');
    }
  };

  //What does this do?
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default newline behavior

      const { selectionStart, selectionEnd, value } = event.target;
      const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(currentLineStart, selectionStart);
      const leadingSpaces = currentLine.match(/^\s*/)[0];

      const newValue = 
        value.substring(0, selectionStart) + '\n' + leadingSpaces + value.substring(selectionEnd);

      setMermaidChart(newValue);

      // Move the cursor to the new position
      setTimeout(() => {
        event.target.selectionStart = event.target.selectionEnd = selectionStart + leadingSpaces.length + 1;
      }, 0);
    }
  };

  const downloadFile = (filename, content) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };
  
  const handleExport = () => {
    let text = ''
    for (let arrows of arrowList) {
      text += arrows[0] + "," + arrows[3] + "," + arrows[1] + "," + arrows[2] + '\n';
    }
    downloadFile('sequencediagram.txt', text);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const content = e.target.result;
      try {
        let columns = [];
        const importedData = content;
        console.log("All");
        console.log(importedData);
  
        // Read data
        let lines = importedData.split('\n');
        for (const line of lines) { // Corrected the loop
          console.log(line);
          let sections = line.split(",");
          if (sections.length == 4) {
            console.log(sections);
            // Set arrows
            setArrowList((arrowList) => [...arrowList, [sections[0], sections[2], sections[3], sections[1]]]);
            columns.push(sections[0]);
            columns.push(sections[2]);
          }
        }
        // Set columns
        // Use set to remove duplicates
        setEvents(Array.from(new Set(columns)));
  
        setMermaidChart(importedData);
      } catch (error) {
        console.error('Error parsing imported data:', error);
        alert('An error occurred while reading the data: ' + error);
      }
    };
  
    reader.readAsText(file);
  };

  const exportImage = () => {
    domtoimage.toBlob(document.getElementById("mermaid-diagram"))
    .then(function (blob) {
        var FileSaver = require('file-saver');
        FileSaver.saveAs(blob, 'sequencediagram.png');
    });
  }
  
  return (
    <main>
      <div>
        <button onClick={handleExport}>Export Data</button>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <button onClick={() => document.getElementById('fileInput').click()}>Import Data</button>
        <button onClick={exportImage}>Export as Image</button>
      </div>
      <div className="full flex justify-center">
        <CollapsibleSpan>
        <span>
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)}/><br/>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button onClick={addItem}>Add Item</button>


          {event.map((item, index) => (
              <div class="change" key={index}>
                {item}
                <button class="right" onClick={() => removeItem(index)}>Remove</button>
                <button class="right" onClick={() => setSelectedItem(item)}>Select</button>
              </div>
            ))}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={event.map((item, index) => "event-list " + item + index)}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ listStyle: 'none', padding: 0 }}
                >
                  {event.map((item, index) => (
                    <Draggable key={item + index} draggableId={item + index} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            padding: '8px',
                            margin: '0 0 8px 0',
                            backgroundColor: '#000',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        >
                          {item}
                          <button class="right" onClick={() => removeItem(index)}>Remove</button>
                          <button class="right" onClick={() => setSelectedItem(item)}>Select</button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          
          <div>
              <h3>Add event for {selectedItem} period</h3>
              <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
                <option value="">Add event</option>
                {event.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={arrowText}
                onChange={(e) => setArrowText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addArrow()}
              />
              <button onClick={addArrow}>Add Arrow</button>
          </div>

          <ul>

            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="arrow-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ listStyle: 'none', padding: 0 }}
                >
                  {arrowList.map((item, index) => (
                    <Draggable key={item + index} draggableId={item + index} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            padding: '8px',
                            margin: '0 0 8px 0',
                            backgroundColor: '#000',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        >
                          {item}
                          <button onClick={() => removeArrowList(index)}>Remove</button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          </ul>
        </span>
        </CollapsibleSpan>
        <span className="half flex-1">
          <Mermaid chart={mermaidChart} key={mermaidChart} />
        </span>
        
      </div>
    </main>
  );
}
