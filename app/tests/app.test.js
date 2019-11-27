/* global describe, afterEach, beforeEach, test, jest, expect */
const handlers = require('../lib/handlers');
const Request = require('jest-express/lib/request').Request;
const Response = require('jest-express/lib/response').Response;
const Octokit = require('@octokit/rest');

jest.mock('@octokit/rest');
jest.mock('../lib/model');

let request, response;

describe('App server', () => {
  let getAuthenticated;
  let paginate;

  beforeEach(() => {
    getAuthenticated = jest.fn().mockReturnValueOnce({
      data: {
        id: 123,
        login: 'abc'
      }
    });

    paginate = jest.fn().mockImplementationOnce(async () => {
      return [];
    });

    const octokit = {
      users: {
        getAuthenticated,
        listFollowersForAuthenticatedUser: {
          endpoint: {
            merge: jest.fn()
          }
        }
      },
      paginate
    };

    Octokit.mockImplementationOnce(() => octokit);
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
  });

  test('getRoot', async () => {
    request = new Request('/', {
      headers: {
        Accept: 'text/html'
      }
    });

    request.session = {
      token: 'abc',
      viewData: {
        user: {
          id: 123456789
        }
      }
    };

    response = new Response();

    await handlers.getRoot(request, response);
    // no error
    expect(response.render).toBeCalled();
  });
});
