import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  FilterList,
  IssueFilter,
  Pagination
} from './styles';

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
    state: 'all',
    issuesFilters: [
      { state: 'all', title: 'Todas' },
      { state: 'open', title: 'Abertas' },
      { state: 'closed', title: 'Fechadas' }
    ],
    page: 1
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository] = await Promise.all([
      api.get(`/repos/${repoName}`),
      this.getIssues(repoName, 'all', 1)
    ]);

    this.setState({
      repository: repository.data,
      loading: false
    });
  }

  async getIssues(repoName, state, page) {
    const issues = await api.get(`/repos/${repoName}/issues?`, {
      params: {
        state,
        per_page: 5,
        page
      }
    });

    this.setState({
      issues: issues.data
    });
  }

  async updateIssues() {
    const { repository, state, page } = this.state;
    console.log(state, page);
    this.getIssues(repository.full_name, state, page);
  }

  async handleChangeIssuesFilter(state) {
    await this.setState({
      state
    });
    this.updateIssues();
  }

  async handlePagination(page) {
    await this.setState({
      page
    });
    this.updateIssues();
  }

  render() {
    const {
      repository,
      issues,
      loading,
      issuesFilters,
      state,
      page
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
              selected={state === filter.state}
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
        <Pagination>
          {page > 1 ? (
            <li onClick={() => this.handlePagination(page - 1)}>
              &#8592; Página anterior
            </li>
          ) : (
            <></>
          )}
          <li onClick={() => this.handlePagination(page + 1)}>
            Página seguinte &#8594;
          </li>
        </Pagination>
      </Container>
    );
  }
}
