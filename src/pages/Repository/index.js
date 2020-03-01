import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, FilterList, IssueFilter } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string
      })
    }).isRequired
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    selectedState: 'all',
    issuesFilters: [
      { state: 'all', title: 'Todos' },
      { state: 'open', title: 'Abertas' },
      { state: 'closed', title: 'Fechadas' }
    ]
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      this.getIssues(repoName, 'all')
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false
    });
  }

  async getIssues(repoName, issuesState) {
    return api.get(`/repos/${repoName}/issues?`, {
      params: {
        state: issuesState,
        per_page: 5
      }
    });
  }

  async handleChangeIssuesFilter(issuesState) {
    const { repository } = this.state;
    const issues = await this.getIssues(repository.full_name, issuesState);

    this.setState({
      issues: issues.data,
      selectedState: issuesState
    });
  }

  render() {
    const {
      repository,
      issues,
      loading,
      issuesFilters,
      selectedState
    } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <FilterList>
          {issuesFilters.map(filter => (
            <IssueFilter
              key={filter.state}
              onClick={() => this.handleChangeIssuesFilter(filter.state)}
              selected={selectedState === filter.state}
            >
              {filter.title}
            </IssueFilter>
          ))}
        </FilterList>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
