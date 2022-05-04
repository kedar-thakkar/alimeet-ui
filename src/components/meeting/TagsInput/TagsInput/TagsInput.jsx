import { data } from "jquery";
import React, { Component } from "react";
import suggestdata from "../../mockData";

class TagsInput extends Component {
  state = {
    tags: [],
    input: "",
    suggestions: []
  };

  handleChange = e => {
    const { value } = e.target;
    this.setState({
      input: value
    });
    this.handleSuggestion();
  };

  handleKeyDown = e => {
    if (e.keyCode === 9) {
      e.preventDefault();
    }
    const { tags, input, suggestions } = this.state;
    const text = suggestions.length ? suggestions[0].text : input;
    if ([9, 13].includes(e.keyCode) && text) {
      this.setState({
        tags: [...tags, text],
        input: ""
      });
    }
  };

  handleSuggestion = () => {
    alert(1)
    const { input, tags } = this.state;
    
    
   
    // const suggestFilterInput = getEmailSuggestion.filter(suggest =>
    //   suggest.text.toLowerCase().includes(input.toLowerCase())
    // );
     
    // const suggestFilterInput = (input) => {
    //   return getEmailSuggestion.filter((suggest) => {
    //     return suggest.text.toLowerCase().includes(input.toLowerCase())
    //   })
    // }
  

    const suggestFilterInput = suggestdata.filter(suggest =>
      suggest.text.toLowerCase().includes(input.toLowerCase())
    );

    const suggestFilterTags = suggestFilterInput.filter(
      suggest => !tags.includes(suggest.text)
    );

    // const suggestFilterTags = suggestFilterInput.filter(
    //   suggest => !tags.includes(suggest.text)
    // );

    // const suggestFilterTags = (suggest,text) => {
    //   return suggestFilterInput.filter((suggest,text) => {
    //     return suggest => !tags.includes(suggest,text)
    //   })
    //   }

      console.log("suggestFilterTags",suggestFilterTags)

    this.setState({
      suggestions: suggestFilterTags
    });
  };

  handleDelete = i => {
    const { tags } = this.state;
    const newTags = tags.filter((tag, j) => i !== j);
    this.setState({
      tags: newTags
    });
  };

  AddTags = text => {
    this.setState({
      tags: [...this.state.tags, text],
      input: ""
    });
  };

  render() {
    const { tags, input, suggestions } = this.state;
    return (
      
      <div className="tags-content">
        {tags.map((tag, i) => (
          <div key={i} className="tag">
            {tag}
            <div className="remove-tag" onClick={() => this.handleDelete(i)}>
              ×
            </div>
          </div>
        ))}
        <div className="tags-input">
          <input
            type="text"
            value={input}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            placeholder="add new tag"
          />
          {input && Boolean(suggestions.length) && (
            <div className="tags-suggestions">
              {suggestions.map(suggest => (
                <div
                  className="suggestion-item"
                  onClick={() => this.AddTags(suggest.text)}
                >
                  {suggest.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default TagsInput;
